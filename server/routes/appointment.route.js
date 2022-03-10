const express = require('express');
const asyncHandler = require('express-async-handler');
const appointmentCtrl = require('../controllers/appointment.controller');
const billCtrl = require('../controllers/bill.controller');
const dashboardCtrl = require('../controllers/dashboard.controller');
const membershipusageCtrl = require('../controllers/membershipusage.controller');
const commonCtrl = require('../controllers/common.controller');
const router = express.Router();
module.exports = router;

router.route('/')
  .post(asyncHandler(appointmentCtrl.getnextdocnumber), asyncHandler(insert), asyncHandler(billCtrl.getnextdocnumber), asyncHandler(getmembershipdiscount), asyncHandler(updatebill))

router.route('/:Id')
  .put(asyncHandler(update), asyncHandler(billCtrl.getnextdocnumber), asyncHandler(getmembershipdiscount), asyncHandler(updatebill))
  .delete(asyncHandler(remove))
  .patch(asyncHandler(patch))
  .get(asyncHandler(findbyId))

router.route('/filter')
  .post(asyncHandler(findcount), asyncHandler(filter), commonCtrl.exportcsv)

router.route('/search/')
  .post(asyncHandler(filter),  commonCtrl.deepobjectsearch_like);

router.route('/multi')
  .post(asyncHandler(appointmentCtrl.getnextdocnumber), asyncHandler(multiappointment), asyncHandler(billCtrl.getnextdocnumber), asyncHandler(getmembershipdiscount), asyncHandler(updatebill))

router.route('/view/filter')
  .post(asyncHandler(findcount), asyncHandler(viewfilter), commonCtrl.exportcsv)

router.route('/staffappointmentview/filter')
  .post(asyncHandler(staffappointmentview))

async function findbyId(req, res) {
  let appointment = await appointmentCtrl.findbyId(req.params.Id);
  res.json(appointment);
}

async function getmembershipdiscount(req, res, next) {
  req.body.services = [req.body.appointment];
  let membershipdiscount = await membershipusageCtrl.getmembershipdiscount(req);
  req.body.membershipdiscount = membershipdiscount ? membershipdiscount : 0;
  next()

}

async function updatebill(req, res) {
  var appointment = req.body.appointment;
  req.body.billdate = new Date();
  req.body.type = "appointment";
  req.body.customerid = appointment.customerid.toString();
  req.body.onModel = appointment.onModel;
  var services = [{
    appointmentid: appointment._id,
    refid: appointment.refid._id,
    appointmentdate: appointment.appointmentdate,
    timeslot: appointment.timeslot,
    amount: appointment.charges,
    taxes : appointment.refid.taxes,
    discount: appointment.discount ? appointment.discount : 0,
    cost: appointment.charges,
    status: appointment.status
  }]
  req.body.services = services;
  let bill = await billCtrl.insert(req);
  req.body.billid = bill._id;
  //appointment = await appointmentCtrl.patch(appointment._id, req);
  appointment = await appointmentCtrl.findbyIdAndUpdate(appointment._id, req);
  res.json(appointment);
}

async function insert(req, res , next) {
  let appointment = await appointmentCtrl.insert(req);
  appointment.customerid = req.body.attendee;
  req.body.appointment = appointment;
  if (req.body.status == "confirmed") next()
  else res.json(appointment);
}

async function update(req, res , next) {
  let appointment = await appointmentCtrl.update(req.params.Id, req);
  appointment.customerid = req.body.attendee;
  req.body.appointment = appointment;
  if (req.body.status == "confirmed"  && !appointment.billid) next()
  else res.json(appointment);
}

async function patch(req, res) {
  let appointment = await appointmentCtrl.patch(req.params.Id, req);
  res.json(appointment);
}

async function remove(req, res) {
  let appointment = await appointmentCtrl.remove(req.params.Id, req);
  res.json(appointment);
}

async function findcount(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "appointment";
  if (req.body.size){
    if (req.body.webpartid) {
      let ids = await dashboardCtrl.webpartfilter(req);
      req.body.search = [{ "searchfield": "_id", "searchvalue": ids, "datatype": "ObjectId", "criteria": "in" }]
    }
    await appointmentCtrl.findcount(req);
    res.header("access-control-expose-headers", "error, totalPages, totalCount");
    res.setHeader("error", req.header.error);
    res.setHeader("totalPages", req.header.totalPages);
    res.setHeader("totalCount", req.header.totalCount);
    next();
  }
  else next()
}

async function filter(req, res, next) {
  if (req.body.webpartid) {
    let ids = await dashboardCtrl.webpartfilter(req);
    req.body.search = [{ "searchfield": "_id", "searchvalue": ids, "datatype": "ObjectId", "criteria": "in" }]
  }
  req.body.formname = req.body.formname? req.body.formname: "appointment";
  let appointments = await appointmentCtrl.filter(req.body);
  if (req.body.export) {
    req.body.data = appointments
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = appointments
    next()
  }
  else res.json(appointments);
}

async function multiappointment(req, res , next) {
  let appointment = await appointmentCtrl.multiappointment(req);
  appointment.customerid = req.body.attendee;
  req.body.appointment = appointment;
  if (req.body.status == "confirmed") next()
  else res.json(appointment);
}


async function viewfilter(req, res, next) {

  req.body.formname = req.body.formname ? req.body.formname : "appointment";
  var viewname = req.body.viewname;
  let appointment;
  if (viewname) {
    appointment = await commonCtrl.viewfilter(req, res);
  }
  else {
    appointment = await appointmentCtrl.viewfilter(req.body);
  }
  if (req.body.export) {
    req.body.data = appointment
    next()
  }
  else if (req.body.search && !Array.isArray(req.body.search)) {
    req.body.data = appointment
    next()
  }
  else res.json(appointment);
}

async function staffappointmentview(req, res) {
  req.body.formname = req.body.formname? req.body.formname: "appointment";
  let staffappointments = await appointmentCtrl.getstaffappointment(req.body);
  res.json(staffappointments);
}
