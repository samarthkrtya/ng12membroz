const Joi = require('joi');
const Member = require('../models/member.model');
const Prospect = require('../models/prospect.model');
const Enquiry = require('../models/enquiry.model');
const Paymentterm = require('../models/paymentterm.model');
const Memberview = require('../views/member.view');
const Activityview = require('../views/activity.view');
const Communicationlogview = require('../views/communicationlog.view');
const Timelineview = require('../views/timeline.view');
const Membercalendarview = require('../views/membercalendar.view');
const Memberwalletview = require('../views/memberwallet.view');
const Memberprofile = require('../views/memberprofile.view');
const Usagesummaryview = require('../views/usagesummary.view');

var ObjectId = require('mongodb').ObjectId;
const memberSchema = Joi.object({
  membernumber: Joi.string().required(),
  property: Joi.object().required(),
  profilepic: Joi.string(),
  password: Joi.string().required(),
  membershipstart: Joi.date(),
  membershipend: Joi.date(),
  membershipid: Joi.string().hex(),
  role: Joi.string().hex().required(),
})

module.exports = {
  insert,
  update,
  patch,
  remove,
  filter,
  filterview,
  viewcalendar,
  timelinefilterview,
  acivityfilterview,
  communicationfilterview,
  walletfilterview,
  findcount,
  viewprofile,
  findbyId,
  exportdata,
  createpaymentterms,
  updatepaymentterms,
  updatepackages,
  checkmember,
  updateuserpassword,
  usagesummaryview,
  updatemembers,
  converttomember,
  enquiryconverttomember
}

async function findbyId(Id) {
  return await Member.findById(Id);
}

async function insert(req) {

  if (req.body.profilepic && Array.isArray(req.body.profilepic)){
    req.body.profilepic = req.body.profilepic[0] ? req.body.profilepic[0].attachment : null
  }
  var member = {
    property: req.body.property,
    profilepic: req.body.profilepic,
    membernumber: req.body.membernumber,
    membershipstart: req.body.membershipstart,
    membershipend: req.body.membershipend,
    membershipid: req.body.membershipid,
    password: req.body.password,
    role: req.body.role
  }
  member = await Joi.validate(member, memberSchema, { abortEarly: false });
  return await new Member(member).save(req);
}


async function updatemembers(req, res, next) {

  Member.find({ status: "active" })
    .exec()
    .then(members => {

      members.forEach(member => {
        // var membernumber = member.membernumber;
        // member.password = membernumber;
        // member.save(req)
        //   .then((savedMember) => {
        //   })
      });

    });
    res.json({})
}


function converttomember(req, res, next) {

  console.log("converttomember called");

  var property = req.body.property;
  req.body.convertmember = true;

  property["branchid"] = req.body.branchid
  
  const member = new Member({
    membernumber: req.body.membernumber,
    username: req.body.username,
    password: req.body.password,
    membershipid: req.body.membershipid,
    membershipstart: req.body.membershipstart,
    membershipend: req.body.membershipend,
    classid: req.body.classid,
    branchid: req.body.branchid ? req.body.branchid: req.body.authkey.branchid._id,
    addedby: req.body.addedby ? req.body.addedby: req.body.authkey._id,
    paymentterms: req.body.paymentterms,
    role: req.body.role,
    property: req.body.property
  });

  member.save(req)
    .then(savedMember => {

      req.body.paymentterms = savedMember.paymentterms;
      var prospectid = req.params.prospectid
        Prospect.findByIdAndUpdate(prospectid, { "$set": { status: 'converted' } }).then()
        req.body.memberid = savedMember._id;
        next()
      
    })
    .catch(function(err){      
      next(err)
    });
}

function enquiryconverttomember(req, res, next) {

  console.log("enquiryconverttomember called");

  var property = req.body.property;
  req.body.convertmember = true;

  property["branchid"] = req.body.branchid
  
  const member = new Member({
    membernumber: req.body.membernumber,
    username: req.body.username,
    password: req.body.password,
    membershipid: req.body.membershipid,
    membershipstart: req.body.membershipstart,
    membershipend: req.body.membershipend,
    classid: req.body.classid,
    branchid: req.body.branchid ? req.body.branchid: req.body.authkey.branchid._id,
    addedby: req.body.addedby ? req.body.addedby: req.body.authkey._id,
    paymentterms: req.body.paymentterms,
    role: req.body.role,
    property: req.body.property
  });

  member.save(req)
    .then(savedMember => {

      req.body.paymentterms = savedMember.paymentterms;
      var enquiryid = req.params.enquiryid
      Enquiry.findByIdAndUpdate(enquiryid, { "$set": { status: 'converted', memberid: savedMember._id } }).then()
        res.json(savedMember);
    })
    .catch(function(err){      
      next(err)
    });
}

async function createpaymentterms(req, res, next) {

  var body = req.body;
  if (Array.isArray(body.paymentterm)) {

    var paytterms = body.paymentterm;

    var memberid = body.memberid;
    var membershipid = body.membershipid;
    
    var paymentterms = [];

    for (const element of paytterms) {

      var paymentterm = {
        memberid: memberid,
        membershipid: membershipid,
        paymentitem: element.paymentitem,
        period: element.period,
        tenure: element.tenure,
        amount: element.amount,
        totalamount: element.totalamount,
        ismembershipfees: element.ismembershipfees,
        discount: element.discount,
        date: element.date,
        startperiod: element.startperiod,
        taxes: element.taxes,
        property: body.property 
      }
      
      var paymentterm = await new Paymentterm(paymentterm).save(req);
      paymentterms.push(paymentterm);
    }
    // console.log("paymentterms", paymentterms)
    //return paymentterms;

    var paymenttermsids = paymentterms.map(choice => (choice._id));

    if (!req.body.membershipstart || req.body.membershipstart=="undefined"){
      req.body.membershipstart = new Date();
    }
  
    Member.findById(memberid)
          .exec()
          .then(member => {
              member._original = member.toObject();
              member.paymentterms = paymenttermsids;
              member.membershipid = membershipid;
              member.membershipstart = req.body.membershipstart;
              member.membershipend = req.body.membershipend;
              member.status = "active"
  
              member.save(req)
                    .then((savedMember) => {
                      req.body.memberid = savedMember._id;
                      req.body.membershipstart = savedMember.membershipstart;
                      req.body.paymentterms = savedMember.paymentterms;
                      next();
                    })
                    .catch(function(e) {
                      next(e)});
            });

  }
  
}

async function updatepaymentterms(req, res, next) {
  var _id = req.body._id;

  if (!req.body.membershipstart || req.body.membershipstart=="undefined"){
    req.body.membershipstart = new Date();
  }

  Member.findById(_id)
        .exec()
        .then(member => {
            member._original = member.toObject();
            member.paymentterms = req.body.paymentterms;
            member.membershipid = req.body.membershipid;
            member.membershipstart = req.body.membershipstart;
            member.membershipend = req.body.membershipend;
            member.status = "active"

            member.save(req)
                  .then((savedMember) => {
                    req.body.memberid = savedMember._id;
                    req.body.membershipstart = savedMember.membershipstart;
                    req.body.paymentterms = savedMember.paymentterms;
                    next();
                  })
                  .catch(function(e) {
                    next(e)});
          });

}

async function updatepackages(req, res, next) {

  var _id = req.body._id;
  var addons = {
    _id: ObjectId(),
    paymentterms: req.body.paymentterms,
    membershipid: req.body.membershipid,
    membershipstart: req.body.membershipstart,
    membershipend: req.body.membershipend
  }
  
  Member.findByIdAndUpdate(_id, { "$push": { addons: addons } }, { new: true })
    .populate("addons.membershipid")
    .populate("addons.paymentterms")
    .exec()
    .then(member => {
      var addon = member.addons.find(el =>{
        return el._id.toString() == addons._id.toString()
      })
      req.body.memberid = member._id;
      req.body.paymentterms = addon.paymentterms;
      next();
    });

}

async function update(Id, req) {

  if (req.body.profilepic && Array.isArray(req.body.profilepic)){
    req.body.profilepic = req.body.profilepic[0] ? req.body.profilepic[0].attachment : null
  }
  var member = await Member.findById(Id);
  member._original = member.toObject();
  member.profilepic = req.body.profilepic
  member.property = req.body.property
  return await member.save(req);
}

async function patch(Id, req) {
  var member = await Member.findById(Id);
  member._original = member.toObject();
  if (member.firsttimelogin && req.body.firsttimelogin) {
    member._original.firsttimelogin = false;
  }
  if (req.body.attachments) member.attachments = req.body.attachments;
  if (req.body.profilepic) member.profilepic = req.body.profilepic;
  if (req.body.status) member.status = req.body.status;
  
  if (req.body.membershipstart) member.membershipstart = req.body.membershipstart;
  if (req.body.membershipend) member.membershipend = req.body.membershipend;
  if (req.body.firsttimelogin) member.firsttimelogin = req.body.firsttimelogin;
  if (req.body.forcelogin) member.forcelogin = req.body.forcelogin;
  if (req.body.password) member.password = req.body.password;
  if (req.body.newpassword) member.password = req.body.newpassword;
  if (req.body.wallets) member.wallets = req.body.wallets;
  if (req.body.addons) member.addons = req.body.addons;
  if (req.body.property) member.property = req.body.property;

  if (req.body.iosdevice) {

    var deviceid = member.iosdevices.find((device) => {
      return device.deviceid == req.body.iosdevice.deviceid;
    })
    if (deviceid) {
      deviceid.registrationid = req.body.iosdevice.registrationid;
    }
    else {
      member.iosdevices.push(req.body.iosdevice);
    }
  }
  if (req.body.anroiddevice) {

    var deviceid = member.anroiddevices.find((device) => {
      return device.deviceid == req.body.anroiddevice.deviceid;
    })
    if (deviceid) {
      deviceid.registrationid = req.body.anroiddevice.registrationid;
    }
    else {
      member.anroiddevices.push(req.body.anroiddevice);
    }

  }
  return await member.save(req);
}

async function remove(Id, req) {
  var member = await Member.findById(Id);
  member.status = "deleted"
  return await member.save(req);
}

async function filter(params) {
  return await Member.getbyfilter(params)
}

async function filterview(params) {
  return await Memberview.getfilterview(params);
}

async function walletfilterview(params) {
  return await Memberwalletview.getfilterview(params)
}

async function usagesummaryview(params) {
  return await Usagesummaryview.getfilterview(params)
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
  return await Member.findcount(req)
}

async function exportdata(params) {
  return await Member.exportdata(params)
}

async function checkmember(req, res, next) {

  var username = req.body.username;
  Member.findOne({
    "$or": [
      { "membernumber": username },
      { "property.primaryemail": username },
      { "property.mobile": username }
    ], status: "active"
  })
    .then((member) => {
      if (member) {
        return res.json(member)
      }
      else {
        return res.json({})
      }
    })
}

async function updateuserpassword(req, res, next) {

  Member.validateuserpassword(req.body.username, req.body.currentpassword)
        .then((member) => {
            if(member){
              member._original = member.toObject();
              member.password =  req.body.password;
              member.save(req)
                  .then(savedMember => res.json(savedMember))
            }
        })
        .catch(e => next(e));
}

async function viewprofile(Id) {
  return await Memberprofile.getprofile(Id);
}

async function viewcalendar(params) {
  return await Membercalendarview.getbyfilter(params)
}
