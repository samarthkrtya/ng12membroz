const express = require('express');
const asyncHandler = require('express-async-handler')
//const passport = require('passport');
const userCtrl = require('../controllers/user.controller');
const authCtrl = require('../controllers/auth.controller');
import Organizationsetting from '../models/organizationsetting.model';
import Auditaction from '../models/auditaction.model';

const router = express.Router();
module.exports = router;

router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login), commonsetting);
router.post('/logout', asyncHandler(logout));
router.post('/memberlogin', asyncHandler(memberlogin), commonsetting);

router.post('/user/resetpassword', asyncHandler(authCtrl.resetuserpassword));
router.post('/member/resetpassword', asyncHandler(authCtrl.resetmemberpassword));

async function register(req, res, next) {
  let user = await userCtrl.insert(req);
  user = user.toObject();
  delete user.hashedPassword;
  req.user = user;
  next()
}

async function logout(req, res, next) {
  let user = req.body.user;  
  let authtoken = req.body.authtoken;  
  if (!user) { return res.json({ "logout": true }); }
  user.type = "User";  
  await authCtrl.logout(user);
  auditlogoff(authtoken, user)
  res.json({ "logout": true })

}

async function login(req, res, next) {
  let user = req.body;
  user.type = "User";
  let token = await authCtrl.generateToken(user);
  if (token.error) {
    const err = new Error(401)
    next(err);
  }
  else {
    auditlogin(req, token)
    req.body.token = token;
    next()
  }
}

async function auditlogin(req, usertoken) { 
  var auditaction = {
    token: usertoken.token,
    ip: req.body.ipAddress,
    addedby: usertoken.user._id,
    onModel: usertoken.usertype,
    branchid: usertoken.user.branchid,
  }
  return await new Auditaction(auditaction).save(req);
}

async function auditlogoff(authtoken, user) {  ;
  // var auditaction = {
  //   action: "logoff successfully - " + user.fullname,
  //   addedby: user._id,
  //   branchid: user.branchid,
  //   category: "logoff"
  // }
  
  return await Auditaction.findOneAndUpdate({ token: authtoken }, { "$set": { logout: new Date, action: "logoff successfully - " + user.fullname, category: "logoff" } });  
}

async function memberlogin(req, res, next) {
  let member = req.body;
  member.type = "Member";
  let token = await authCtrl.generateToken(member);
  if (token.error) {
    const err = new Error(401)
    next(err);
  }
  else {
    auditlogin(req, token)
    req.body.token = token;
    next()
  }
}

function commonsetting(req, res, next) {
  var data = req.body.token;
  Organizationsetting.findOne({})
  .then((setting) =>{
      data.currency = data.user.branchid.currency;
      data.organizationsetting = setting;
      res.json(data);
    })

}
