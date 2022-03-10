const Joi = require('joi');
const User = require('../models/user.model');
const Usercalendar = require('../views/usercalendar.view');
const Staffattendanceview = require('../views/staffattendance.view');
const Activityview = require('../views/activity.view');
const Communicationlogview = require('../views/communicationlog.view');
const Timelineview = require('../views/timeline.view');
const Userview = require('../views/user.view');
const Userprofile = require('../views/userprofile.view');
const Userwalletview = require('../views/userwallet.view');
const common = require('../helpers/common');

const userSchema = Joi.object({
  username: Joi.string().required(),
  role: Joi.string().hex().required(),
  branchid: Joi.string().hex(),
  password: Joi.string().required(),
  property: Joi.object().required(),
  designationid: Joi.string().hex().required(),
  profilepic: Joi.string().allow(null)
})


module.exports = {
  insert,
  update,
  remove,
  patch,
  filter,
  viewcalendar,
  viewprofile,
  viewattenance,
  timelinefilterview,
  acivityfilterview,
  communicationfilterview,
  findcount,
  findbyId,
  exportdata,
  checkuser,
  viewfilter,
  updateuserpassword,
  walletfilterview
}


async function walletfilterview(params) {
  return await Userwalletview.getfilterview(params)
}

async function findbyId(Id) {
  return await User.findById(Id);
}

async function patch(Id, req) {
  var user = await User.findById(Id);
  user._original = user.toObject();
  if (user.firsttimelogin && req.body.firsttimelogin) {
    user._original.firsttimelogin = false;
  }
  if (req.body.attachments) user.attachments = req.body.attachments;
  if (req.body.servicecharges) user.servicecharges = req.body.servicecharges;
  if (req.body.profilepic) user.profilepic = req.body.profilepic;
  if (req.body.status) user.status = req.body.status;
  if (req.body.firsttimelogin) user.firsttimelogin = req.body.firsttimelogin;
  if (req.body.forcelogin) user.forcelogin = req.body.forcelogin;
  if (req.body.newpassword) user.password = req.body.newpassword;
  if (req.body.password) user.password = req.body.password;
  if (req.body.property) user.property = req.body.property;
  if (req.body.salarycomponents) user.salarycomponents = req.body.salarycomponents;
  if (req.body.salarycomponent) user.salarycomponents.push(req.body.salarycomponent);
  if (req.body.leavecomponents) user.leavecomponents = req.body.leavecomponents;
  if (req.body.leavecomponent) user.leavecomponents.push(req.body.leavecomponent);
  if (req.body.hourlyrate) user.hourlyrate = req.body.hourlyrate;
  if (req.body.availability) user.availability = req.body.availability;
  if (req.body.breaktime) user.breaktime = req.body.breaktime;
  if (req.body.duration) user.duration = req.body.duration;
  if (req.body.manager) user.manager = req.body.manager;


  if (req.body.iosdevice) {

    var deviceid = user.iosdevices.find((device) => {
      return device.deviceid == req.body.iosdevice.deviceid;
    })
    if (deviceid) {
      deviceid.registrationid = req.body.iosdevice.registrationid;
    }
    else {
      user.iosdevices.push(req.body.iosdevice);
    }
  }
  if (req.body.anroiddevice) {

    var deviceid = user.anroiddevices.find((device) => {
      return device.deviceid == req.body.anroiddevice.deviceid;
    })
    if (deviceid) {
      deviceid.registrationid = req.body.anroiddevice.registrationid;
    }
    else {
      user.anroiddevices.push(req.body.anroiddevice);
    }

  }

  return await user.save(req);
}

async function insert(req) {
  if (req.body.profilepic && Array.isArray(req.body.profilepic)) {
    req.body.profilepic = req.body.profilepic[0] ? req.body.profilepic[0].attachment : undefined
  }
  var user = {
    username: req.body.username,
    password: req.body.password,
    profilepic: req.body.profilepic,
    role: req.body.role ? req.body.role : req.body.property.role,
    designationid: req.body.designationid,
    branchid: req.body.property.branchid ? req.body.property.branchid : undefined,
    property: req.body.property,
  }

  if (!user.role) {
    user.role = getmappingrole(req);
  }

  user = await Joi.validate(user, userSchema, { abortEarly: false });
  return await new User(user).save(req);
}

function getmappingrole(req) {

  var role;
  var solutiontype = req.body.authkey.branchid.solutiontype;
  switch (solutiontype) {
    case "Club, Resort & Hotel":
      role = "612df3e6bfd7601700ac1bd4";
      break;

    case "Vacation & Hospitality Timeshare":
      role = "612f53dcbfd7600da0745938";
      break;

    case "Tour & Travel":
      role = "613069e1bfd7602f90774cd6";
      break;

    case "Gym, Yoga & Fitness Center":
      role = "613071afbfd7602f90774cfb";
      break;

    case "Spa, Salon & Wellness Center":
      role = "6130b200bfd7602f90774de6";
      break;

    case "Restaurant, Pubs & Bar":
      role = "61370729bfd76014a4c66b92";
      break;

    case "Dietician & Nutritionist":
      role = "6131af23bfd76014fc640aae";
      break;

    case "Service, Workshop & Maintenance":
      role = "612f1d96bfd76028b0b81497";
      break;

    case "Community, Association & Society":
      role = "6131c399bfd76014fc640b01";
      break;

    case "Franchise, Distributor & Agency":
      role = "613700bebfd76014a4c66b44";
      break;

    // case "Doctor Clinic & Polyclinic":
    //   role = "5dd7e32c80199f0aecd400bb";
    //   break;

    case "Venue & Facility Booking":
      role = "6135fc8cbfd760062ce35f20";
      break;

    case "Consulting & Coaching Service":
      role = "61bc70768cd5a60fb3c60e5b";
      break;

    case "Apartment, Equipment & Car Rental":
      role = "61370c87bfd76014a4c66bd4";
      break;

    default:
      role = "6131c399bfd76014fc640b01";
  }

  return role;
}

async function update(Id, req) {
  if (req.body.profilepic && Array.isArray(req.body.profilepic)) {
    req.body.profilepic = req.body.profilepic[0] ? req.body.profilepic[0].attachment : undefined
  }
  var availability = req.body.availability;
  if (availability.availibilitydate)
    availability.availibilitydate = common.convertolocaltime(req.body, availability.availibilitydate);
    
  var user = await User.findById(Id);
  user._original = user.toObject();
  user.role = req.body.role;
  user.profilepic = req.body.profilepic;
  user.designationid = req.body.designationid;
  user.availability =  availability;
  user.servicecharges = req.body.servicecharges;
  user.property = req.body.property;
  return await user.save(req);
}

async function remove(Id, req) {
  var userid = req.body.authkey._id.toString();
  if (userid==Id) {
    throw Error("You can not delete this record")
  }
  var user = await User.findById(Id);
  user.status = "deleted"
  return await user.save(req);
}

async function filter(params) {
  return await User.getbyfilter(params)
}

async function viewcalendar(params) {
  return await Usercalendar.getbyfilter(params)
}

async function viewattenance(params) {
  return await Staffattendanceview.filterview(params)
}

async function viewfilter(params) {
  return await Userview.getfilterview(params)
}

async function acivityfilterview(params) {
  return await Activityview.getfilterview(params)
}

async function communicationfilterview(params) {
  return await Communicationlogview.getfilterview(params)
}

async function timelinefilterview(params) {
  return await Timelineview.getfilterview(params)
}

async function findcount(req) {
  return await User.findcount(req)
}

async function exportdata(params) {
  return await User.exportdata(params)
}


async function checkuser(req, res, next) {

  var username = req.body.username;
  var query = {
    "$or": [
      { "username": username },
      { "property.primaryemail": username },
      { "property.mobile": username }
    ], status: "active"
  }
  User.findOne(query)
    .then((user) => {
      if (user) {
        return res.json(user)
      }
      else {
        return res.json({})
      }
    })
}

async function updateuserpassword(req, res, next) {

  User.validateuserpassword(req.body.username, req.body.currentpassword)
    .then((user) => {
      if (user) {
        user._original = user.toObject();
        user.password = req.body.password;
        //console.log(user)
        user.save(req)
          .then(savedUser => res.json(savedUser))
      }
    })
    .catch(e => next(e));
}


async function viewprofile(Id) {
  return await Userprofile.getprofile(Id);
}
