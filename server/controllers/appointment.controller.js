const Joi = require('joi');
const Appointment = require('../models/appointment.model');
const Appointmentview = require('../views/appointment.view');
const Staffappointmentview = require('../views/staffappointment.view');
const common = require('../helpers/common');
var ObjectId = require('mongodb').ObjectId;
const appointmentSchema = Joi.object({
  number: Joi.number().required(),
  prefix: Joi.string(),
  appointmentdate: Joi.date().required(),
  packageid: Joi.string().hex().allow(null),
  attendee: Joi.string().hex().required(),
  onModel: Joi.string().required(),
  host: Joi.string().hex(),
  refid: Joi.string().hex().allow(null),
  eventid: Joi.string().hex().allow(null),
  timeslot: Joi.object().required(),
  charges: Joi.number().required(),
  duration: Joi.number().required(),
  resourceids: Joi.array().allow(null),
  status: Joi.string(),
  property: Joi.object(),
  deposits: Joi.object(),
})


module.exports = {
  insert,
  update,
  remove,
  patch,
  filter,
  filterview,
  findcount,
  findbyId,
  exportdata,
  getnextdocnumber,
  updateappointments,
  findbyIdAndUpdate,
  multiappointment,
  getstaffappointment
}

async function findbyIdAndUpdate(Id, req) {
  return await Appointment.findByIdAndUpdate(Id, { billid: req.body.billid }, { new: true })
}

async function getnextdocnumber(req, res, next) {

  var branch = req.body.authkey.branchid;
  var prefix = "";

  if (DATABASETYPE == "branchwise") {
    var docformat = branch.docformat;
    prefix = docformat.appointment ? docformat.appointment["prefix"] : "AP";
  } else {
    var docformat = BILLFORMAT;
    if (docformat)
      prefix = docformat.appointment ? docformat.appointment["prefix"] : "AP";
  }

  Appointment.getnextdocnumber(prefix, branch._id)
    .then((number) => {
      req.body.number = number;
      req.body.prefix = prefix;
      if (!req.body.attendee) return res.json(prefix + "-" + number);
      else next();
    })
    .catch((e) => next(e));

}


async function filterview(req) {
  return await Appointmentview.getfilterview(req)
}

function updateappointments(req, res, next) {

  var bill = req.body.bill;
  var status = req.body.status;
  for (var i = 0; i < bill.services.length; i++) {
    if (!status) status = bill.services[i].status;
    Appointment.findByIdAndUpdate(bill.services[i].appointmentid, { "$set": { billid: bill._id, status: status } }).then()
  }
  for (var i = 0; i < bill.packages.length; i++) {
    for (var j = 0; j < bill.packages[i].bookingids.length; j++) {
      if (!status) status = bill.packages[i].bookingids[j].bookingid.status;
      Appointment.findByIdAndUpdate(bill.packages[i].bookingids[j].bookingid._id, { "$set": { billid: bill._id, status: status } }).then()
    }
  }

}

async function findbyId(Id) {
  return await Appointment.findById(Id);
}

async function insert(req) {

  var body = req.body;
  if (Array.isArray(body.appointmentdate)) {

    var dates = body.appointmentdate;
    var number = body.number;
    var appointments = [];
    for (const element of dates) {
      var appointment = {
        number: number,
        prefix: body.prefix,
        appointmentdate: element,
        attendee: body.attendee,
        onModel: body.onModel,
        host: body.host,
        refid: body.refid && body.refid._id ? body.refid._id : body.refid,
        timeslot: body.timeslot,
        charges: body.charges,
        duration: body.duration,
        resourceids: body.resourceids,
        status: body.status,
        property: body.property,
      }
      number += 1;
      var appointment = await Joi.validate(appointment, appointmentSchema, { abortEarly: false });
      appointment = await new Appointment(appointment).save(req);
      appointments.push(appointment);
    }

    return appointments;

  }
  else {
    var appointment = {
      number: body.number,
      prefix: body.prefix,
      appointmentdate: body.appointmentdate,
      attendee: body.attendee,
      onModel: body.onModel,
      host: body.host,
      refid: body.refid && body.refid._id ? body.refid._id : body.refid,
      timeslot: body.timeslot,
      charges: body.charges,
      duration: body.duration,
      status: body.status,
      resourceids: body.resourceids,
      property: body.property,
    }
    await Joi.validate(appointment, appointmentSchema, { abortEarly: false });
    return await new Appointment(appointment).save(req);
  }

}

async function update(Id, req) {
  var body = req.body;
  var appointment = await Appointment.findById(Id);
  appointment._original = appointment.toObject();
  appointment.appointmentdate = common.convertolocaltime(req.body, body.appointmentdate),
    appointment.attendee = body.attendee,
    appointment.onModel = body.onModel,
    appointment.host = body.host,
    appointment.refid = body.refid && body.refid._id ? body.refid._id : body.refid,
    appointment.eventid = body.eventid,
    appointment.timeslot = body.timeslot,
    appointment.charges = body.charges,
    appointment.duration = body.duration,
    appointment.status = body.status,
    appointment.resourceid = body.resourceid,
    appointment.property = body.property
  return await appointment.save(req);
}

async function patch(Id, req) {
  var appointment = await Appointment.findById(Id);
  appointment._original = appointment.toObject();
  if (req.body.billid) appointment.billid = req.body.billid;
  if (req.body.status) appointment.status = req.body.status;
  if (req.body.appointmentdate) appointment.appointmentdate = common.convertolocaltime(req.body, req.body.appointmentdate);
  if (req.body.attendee) appointment.attendee = req.body.attendee;
  if (req.body.onModel) appointment.onModel = req.body.onModel;
  if (req.body.refid) appointment.refid = req.body.refid;
  if (req.body.timeslot) appointment.timeslot = req.body.timeslot;
  if (req.body.host) appointment.host = req.body.host;
  if (req.body.property) appointment.property = req.body.property;
  if (req.body.resourceids) appointment.resourceids = req.body.resourceids;
  if (req.body.deposits) appointment.deposits = req.body.deposits;
  if (req.body.charges) appointment.charges = req.body.charges;
  return await appointment.save(req);
}

async function remove(Id, req) {
  var appointment = await Appointment.findById(Id);
  appointment.status = "deleted"
  return await appointment.save(req);
}

async function filter(params) {
  return await Appointment.getbyfilter(params)
}

async function findcount(req) {
  return await Appointment.findcount(req)
}

async function exportdata(params) {
  return await Appointment.exportdata(params)
}

async function multiappointment(req) {

  var body = req.body;
  if (Array.isArray(body.services)) {

    var services = body.services;
    var number = body.number;
    if (body.packageid && body.services.length > 1) {
      var linkid = new ObjectId();
    }
    var appointments = [];
    for (const element of services) {
      element.property['linkid'] = linkid;
      var appointment = {
        number: number,
        prefix: body.prefix,
        appointmentdate: common.convertolocaltime(req.body, element.date),
        packageid: body.packageid,
        attendee: body.attendee,
        onModel: body.onModel,
        host: element.host,
        refid: element.refid && element.refid._id ? element.refid._id : element.refid,
        resourceids: element.resourceids,
        eventid: element.eventid,
        timeslot: element.timeslot,
        charges: element.charges,
        duration: element.duration,
        status: element.status ? element.status : body.status,
        property: element.property,
      }

      number += 1;
      var appointment = await Joi.validate(appointment, appointmentSchema, { abortEarly: false });
      appointment = await new Appointment(appointment).save(req);
      appointments.push(appointment);
    }

    return appointments;

  }

}

async function getstaffappointment(req) {
  return await Staffappointmentview.getfilterview(req)
}
