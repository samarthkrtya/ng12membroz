const express = require('express');
const asyncHandler = require('express-async-handler');
const activityCtrl = require('../controllers/activity.controller');
const appointmentCtrl = require('../controllers/appointment.controller');
const enquiryCtrl = require('../controllers/enquiry.controller');
const commonCtrl = require('../controllers/common.controller');
const communicationCtrl = require('../controllers/communication.controller');
const dashboardCtrl = require('../controllers/dashboard.controller');
const dispositionCtrl = require('../controllers/disposition.controller');
const router = express.Router();
module.exports = router;
//router.use(passport.authenticate('jwt', { session: false }))

router.route('/')
  .post(asyncHandler(dispositionCtrl.convertdatatype), asyncHandler(insert), asyncHandler(updatehandler))

router.route('/:Id')
  .put(asyncHandler(update))
  .patch(asyncHandler(patch))
  .get(asyncHandler(findbyId))

router.route('/filter')
.post(asyncHandler(findcount), asyncHandler(filter), commonCtrl.exportcsv)

router.route('/view/filter/')
  .post(asyncHandler(viewfilter))

router.route('/jobactivityview/filter/')
  .post(asyncHandler(jobactivityview))

router.route('/filter/crmapp')
.post(asyncHandler(crmappview))

async function findbyId(req, res) {
  let activity = await activityCtrl.findbyId(req.params.Id);
  res.json(activity);
}

async function insert(req, res, next) {
  let activity = await activityCtrl.insert(req);
  if (activity.dispositionid.action == "communication") {
    activity.customerid.primaryemail = activity.customerid.property.primaryemail;
    activity.customerid.mobile = activity.customerid.property.mobile;
    activity.customerid.whatsapp = activity.customerid.property.whatsapp;
    var communication = activity.dispositionid.communication;
    req.body.subject = communication.subject;
    req.body.content =  communication.content;
    req.body.type = communication.communicationtype;
    req.body.recipients = [activity.customerid];
    req.body.attachment = communication.attachment;
    req.body.activity = activity;
    await communicationCtrl.sendannouncement(req, res);
  }
  
  if (activity.assingeeuser && activity.assingeeuser.toString() == req.body.authkey._id.toString()){
    res.json(activity);
  }
  else if (activity.assingeeuser && activity.onModel == "Enquiry") {
    req.params.Id = activity.customerid._id ? activity.customerid._id : activity.customerid;
    req.body.handlerid = activity.assingeeuser._id ? activity.assingeeuser._id : activity.assingeeuser;
    req.body.activity = activity;
    req.body.property = undefined; // to prevent fullname update
    req.body.status = undefined; // to prevent fullname update
    next()
  }
  else {
    res.json(activity);
  }
}

async function update(req, res) {
  let activity = await activityCtrl.update(req.params.Id, req);
  res.json(activity);
}

async function patch(req, res) {
  let activity = await activityCtrl.patch(req.params.Id, req);
  res.json(activity);
}

async function updatehandler(req, res) {
  let enquiry = await enquiryCtrl.patch(req.params.Id, req);
  res.json(req.body.activity);
}

async function filter(req, res, next) {
  if (req.body.webpartid) {
    let ids = await dashboardCtrl.webpartfilter(req);
    req.body.search = [{ "searchfield": "_id", "searchvalue": ids, "datatype": "ObjectId", "criteria": "in" }]
  }
  req.body.formname = req.body.formname? req.body.formname: "activitylog";
  let activities = await activityCtrl.filter(req.body);

  if (req.body.export) {
    req.body.data = activities;
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = activities;
    next()
  }
  else res.json(activities);
}

async function findcount(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "activitylog";
  if (req.body.size){
    if (req.body.webpartid) {
      let ids = await dashboardCtrl.webpartfilter(req);
      req.body.search = [{ "searchfield": "_id", "searchvalue": ids, "datatype": "ObjectId", "criteria": "in" }]
    }
    await activityCtrl.findcount(req);
    res.header("access-control-expose-headers", "error, totalPages, totalCount");
    res.setHeader("error", req.header.error);
    res.setHeader("totalPages", req.header.totalPages);
    res.setHeader("totalCount", req.header.totalCount);
    next();
  }
  else next()
}

async function viewfilter(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "activitylog";
  let activities = await activityCtrl.filterview(req.body);
  res.json(activities)
}

async function getappointments(req, res, next) {
  req.body.formname = "appointment";  
  let appointments = await appointmentCtrl.filterview(req.body);
  req.body.appointments = appointments;
  res.json(req.body.activities)
}

async function jobactivityview(req, res) {
  req.body.formname = req.body.formname? req.body.formname: "activitylog";
  let jobactivities = await activityCtrl.jobactivityview(req.body);
  res.json(jobactivities);
}

async function crmappview(req, res) {
  let activities = await activityCtrl.crmappview(req.body);
  res.json(activities);
}

