import Member from '../models/member.model';
import User from '../models/user.model';
import Branch from '../models/branch.model';

module.exports = {
  processMember,
  processUser
}

async function processMember(req, res, next) {

  var license = req.body.authkey.branchid.license;
  if (license && license.members) {
    var branchid = req.body.authkey.branchid._id;
    var membercount = await Member.countDocuments({ status: "active", branchid: branchid })
    if (membercount >= license.members) {
      throw new Error(`You exhousted maximum license, Please purchase additional license`);
    }
  }

  var membernumber = req.body.membernumber;
  var solution = req.body.authkey.branchid.solutiontype;
  var query = {}
  if (membernumber && membernumber != "undefined" && membernumber != "") {
    req.body.formid = "599673a925f548d7dbbd7c86";
    req.body.username = membernumber;
    req.body.role = getmemberrole(solution);
    req.body.password = req.body.password ? req.body.password : membernumber;
    next();
  }
  else {
    var branch = req.body.authkey.branchid;
    if (DATABASETYPE == "branchwise") {
      query["branchid"] = branch._id;
    }

    var startingnumber = branch.startingnumber;

    return Member.getLastMember(query)
      .then((lastmember) => {
        if (!lastmember) {
          var numbers = startingnumber.match(/\d+/g).map(Number);
          if (!numbers) lastmember = "MEMBROZ10000"
          if (numbers && numbers.length > 0) {
            var element = numbers[numbers.length - 1];
            var newnumber = parseInt(element) + 1;
            lastmember = startingnumber.replace(element, newnumber)
          }
        }
        else {
          var numbers = lastmember.match(/\d+/g).map(Number);
          if (!numbers) lastmember = "MEMBROZ10000"
          if (numbers && numbers.length > 0) {
            var element = numbers[numbers.length - 1];
            var newnumber = parseInt(element) + 1;
            lastmember = lastmember.replace(element, newnumber)
          }
        }
        req.body.membernumber = lastmember;
        req.body.formid = "599673a925f548d7dbbd7c86";
        req.body.password = req.body.password ? req.body.password : lastmember;
        req.body.role = getmemberrole(solution)
        next()

      })
      .catch(function (err) {
        next(err)
      });

  }

}

function getmemberrole(solutiontype) {

  // Apartment, Equipment & Car Rental
  // Cloud Manage Service
  // Club, Resort & Hotel
  // Community, Association & Society
  // Consulting & Coaching Service
  // Dietician & Nutritionist
  // Doctor Clinic & Polyclinic
  // Finance, Insurance & Law
  // Franchise, Distributor & Agency
  // Gym, Yoga & Fitness Center
  // Housing & Business Complex
  // Housing & Commercial Complex
  // Restaurant, Pubs & Bar
  // Service, Workshop & Maintenance
  // Spa, Salon & Wellness Center
  // Tour & Travel
  // Tour, Travel & Timeshare
  // Vacation & Hospitality Timeshare
  // Venue & Facility Booking
  if (MEMBERROLE) return MEMBERROLE;

  var role;
  switch (solutiontype) {
    case 'Apartment, Equipment & Car Rental':
      role = "6063f42fc49da515b4a2d48b";
      break;
    case 'Club, Resort & Hotel':
      role = "6062f1dfc49da53b14df1789";
      break;
    case 'Community, Association & Society':
      role = "6063f496c49da515b4a2d492";
      break;
    case 'Consulting & Coaching Service':
      role = "6065869499e17f235c59eff8";
      break;
    case 'Dietician & Nutritionist':
      role = "6062fdbcc49da53b14df17b9";
      break;
    case 'Doctor Clinic & Polyclinic':
      role = "6065860799e17f235c59eff6";
      break;
    case 'Finance, Insurance & Law':
      role = "6065873299e17f235c59effd";
      break;
    case 'Gym, Yoga & Fitness Center':
      role = "6062ca5d28ca017226ac8911";
      break;
    case 'Housing & Business Complex':
      role = "6063f496c49da515b4a2d492";
      break;
    case 'Restaurant, Pubs & Bar':
      role = "6065863199e17f235c59eff7";
      break;
    case 'Service, Workshop & Maintenance':
      role = "60630030c49da53b14df17d8";
      break;
    case 'Spa, Salon & Wellness Center':
      role = "6062fec7c49da53b14df17c9";
      break;
    case 'Tour & Travel':
      role = "60630655c49da53b14df17f1";
      break;
    case 'Tour, Travel & Timeshare':
      role = "60630655c49da53b14df17f1";
      break;
    case 'Vacation & Hospitality Timeshare':
      role = "60630655c49da53b14df17f1";
      break;
    case 'Venue & Facility Booking':
      role = "606585ed99e17f235c59eff5";
      break;
    case 'Franchise, Distributor & Agency':
      role = "6063f6c7c49da515b4a2d4b7";
      break;
    default:
      role = "59c1fb52b985482b2c610cee";
  }

  return role;

}

async function processUser(req, res, next) {

  var license = req.body.authkey.branchid.license;
  var branchid = req.body.property.branchid;

  if (license && license.users) {
    if (!branchid) branchid = req.body.authkey.branchid._id;
    var usercount = await User.countDocuments({ status: "active", branchid: branchid })
    if (usercount >= license.users) {
      throw new Error(`You exhousted maximum license, Please purchase additional license`);
    }
  }

  var username = req.body.username;
  var query = {}
  if (username && username != "undefined" && username != "") {
    req.body.username = username;
    req.body.password = req.body.password ? req.body.password : "pass#123";
    return;
  }
  else {
    var branch;
    if (!branchid) {
      branchid = req.body.authkey.branchid._id;
      branch = req.body.authkey.branchid
    }
    else {
      branch = await Branch.findById(branchid);
    }
    if (DATABASETYPE == "branchwise") {
      query["branchid"] = branchid;
    }
    var startingnumber = branch.startingusernumber;
    return User.getLastUser(query)
      .then((lastuser) => {
        if (!lastuser) {
          var numbers = startingnumber.match(/\d+/g).map(Number);
          if (!numbers) lastuser = "MEMBROZ10000" 
          if (numbers && numbers.length > 0) {
            var element = numbers[numbers.length - 1];
            var newnumber = parseInt(element) + 1;
            lastuser = startingnumber.replace(element, newnumber)
          }
        }
        else {
          if (!lastuser.match(/\d+/g)) {
            lastuser = "MEMBROZ10000"
          }
          var numbers = lastuser.match(/\d+/g).map(Number);
          if (numbers && numbers.length > 0) {
            var element = numbers[numbers.length - 1];
            var newnumber = parseInt(element) + 1;
            lastuser = lastuser.replace(element, newnumber)
          }
        }
        req.body.username = lastuser;
        req.body.password = req.body.password ? req.body.password : "pass#123";
        next()

      })
    }
  // req.body.password = "pass#123";
  // if (USERNAMEFORMAT == "email" || !req.body.username) {
  //   req.body.username = req.body.property.primaryemail;
  // }
}
