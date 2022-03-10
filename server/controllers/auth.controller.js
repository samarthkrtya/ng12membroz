const jwt = require('jsonwebtoken');
const config = require('../config/config');
import User from '../models/user.model';
import Member from '../models/member.model';
import Dashboard from '../models/dashboard.model';
var ObjectID = require('mongodb').ObjectID;

module.exports = {
  generateToken,
  logout,
  resetmemberpassword,
  resetuserpassword
}

async function logout(user) {
  return await User.findByIdAndUpdate(user._id, { "property.live": false, "property.livechat": [] }, { new: true }).then();
}

async function generateToken(user) {

  var userid = user.username;

  if (user.type == "Member") {

    var fields = MEMBER_LOGIN_FIELD;
    if (fields && fields.length == 0) fields.push("membernumber");

    for (var i = 0; i < fields.length; i++) {

      var element = fields[i];
      var query = {};
      query[element] = userid;
      query["status"] = "active";
      var member = await Member.getbyUsername(query, user.password)
      //console.log("member", member)
      if (member) {
        const token = jwt.sign({
          username: member.username
        }, config.jwtSecret);
        if (member.forcelogin) {
          Member.findByIdAndUpdate(member._id, { forcelogin: false }, { new: true }).then()
        }

        var dashboard = member.role.dashboard;

        return Dashboard.findById(dashboard._id)
          .then((dashboard) => {
            member.role.dashboard = dashboard;
            return {
              token,
              username: member.membernumber,
              user: member,
              usertype: "Member"
            };
          })
      }

    }

    return { error: "Invalid login" }

  }
  else {

    var fields = USER_LOGIN_FIELD;
    if (fields && fields.length == 0) fields.push("username");
    //console.log("fields", fields)
    for (var i = 0; i < fields.length; i++) {

      var element = fields[i];
      var query = {};
      query[element] = userid;
      query["status"] = { "$eq": "active" };
      var search = user.search;
      if (search) {
        search.forEach(element => {
          var criteria = element["criteria"];
          if (!criteria) criteria = "eq";
          if (element['datatype'] == 'ObjectId') element["searchvalue"] = ObjectID(element["searchvalue"])

          switch (criteria) {
            case "eq":
              query[element["searchfield"]] = { "$eq": element["searchvalue"] };
              break;
            case "in":
              query[element["searchfield"]] = { "$in": element["searchvalue"] };
              break;
            default:
              query[element["searchfield"]] = { "$eq": element["searchvalue"] };
          }

        });
      }

      var userlogin = await User.getbyUsername(query, user.password)
      //console.log("query", query)
      if (userlogin) {

        const token = jwt.sign({
          username: userlogin.username
        }, config.jwtSecret);

        if (userlogin.forcelogin) {
          User.findByIdAndUpdate(userlogin._id, { forcelogin: false }, { new: true }).then()
        }
        User.findByIdAndUpdate(userlogin._id, { "property.live": true }, { new: true }).then();

        var dashboard = userlogin.role.dashboard;

        return Dashboard.findById(dashboard._id)
          .then((dashboard) => {
            userlogin.role.dashboard = dashboard;
            return {
              token,
              username: userlogin.username,
              user: userlogin,
              usertype: "User"
            };
          })
      }
    }

    return { error: "Invalid login" }

  }

}

/**
 * change password.
 * @returns {User}
 */
function resetuserpassword(req, res, next) {

  var password = req.body.newpassword;
  var username = req.body.username;

  User.findOne({ username: username, status: "active" })
        .then((user) => {
            if(user){
              user.password =  password;
              user.firsttimelogin = false;
              user.save(req)
                  .then(savedUser => {
                    return res.json(savedUser)
                  })
            }
            else {
              const err = new Error('No such user exists!');
              return res.json(err);
            }
        })
        .catch(e => next(e));
}

// /**
//  * change password.
//  * @returns {User}
//  */
// function resetmemberpassword(req, res, next) {

//   var password = req.body.newpassword;
//   var membernumber = req.body.username;

//   Member.findOne({ membernumber: membernumber, status: "active" })
//         .then((member) => {
//             if(member)
//             {
//                 member.password =  password;
//                 member.firsttimelogin =  false;
//                 if (req.body.forcelogin) member.forcelogin = req.body.forcelogin;
//                 member.save(req)
//                     .then(savedMember => {
//                       return res.json(savedMember)
//                     })
//             }
//             else {
//               const err = new Error('No such member exists!');
//               return res.json(err);
//             }
//         })
//         .catch(e => next(e));
// }

/**
 * change password.
 * @returns {User}
 */
function resetuserpassword(req, res, next) {

  var password = req.body.newpassword;
  var username = req.body.username;

  User.findOne({ "$or" : [
    {
        "username" : username
    },
    {
        "property.primaryemail" : username
    },
    {
        "property.mobile" : username
    }] })
        .then((user) => {
            if(user){
              user.password =  password;
              user.isfirstlogin = false;
              user.save(req)
                  .then(savedUser => {
                    res.json(savedUser)
                  })
                  .catch(e => next(e));
            }
            else {
              const err = new Error('No such user exists!');
              return res.json(err);
            }
        })
        .catch(e => next(e));
}
/**
 * change password.
 * @returns {User}
 */
function resetmemberpassword(req, res, next) {
  var password = req.body.newpassword;
  var membernumber = req.body.username;
  Member.findOne({ "$or" : [
    {
        "membernumber" : membernumber
    },
    {
        "property.primaryemail" : membernumber
    },
    {
        "property.mobile" : membernumber
    }] })
        .then((member) => {
            if(member)
            {
                member._original = member.toObject();
                member.password =  password;
                var prop = member.property;
                prop['passwordchange'] = true;
                member.firsttimelogin =  false;
                member.save(req)
                    .then(savedMember => {
                      ////console.log(savedMember);
                      res.json(savedMember)
                    })
                    .catch(e => next(e));
            }
            else {
              const err = new Error('No such member exists!');
              return res.json(err);
            }
        })
        .catch(e => next(e));
}
