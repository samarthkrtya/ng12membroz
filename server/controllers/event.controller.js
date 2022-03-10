// const bcrypt = require('bcrypt');
const Joi = require('joi');
const Event = require('../models/event.model');
const Eventview = require('../views/event.view');


const eventSchema = Joi.object({
  title: Joi.string().required(),
  location: Joi.string().hex(),
  groupid: Joi.string().hex(),
  attendeeids: Joi.array(),
  attachments: Joi.array(),
  property: Joi.object()
})


module.exports = {
  insert,
  update,
  patch,
  remove,
  filter,
  filterview,
  findcount,
  findbyId,
  exportdata
}

async function findbyId(Id) {
  return await Event.findById(Id);
}

async function insert(req) {

  var property = req.body.property;
  property['startdate'] = property['startdate'] ? new Date(property['startdate']) : null;
  property['enddate'] = property['enddate'] ? new Date(property['enddate']) : null;
  var event = {
    title: req.body.title,
    location: req.body.location,
    groupid: req.body.groupid,
    property: property,
  }

  event = await Joi.validate(event, eventSchema, { abortEarly: false });
  return await new Event(event).save(req);
}

async function update(Id, req) {
  var event = await Event.findById(Id);
  event._original = event.toObject();
  event.title = req.body.title,
  event.location = req.body.location,
  event.tickets = req.body.tickets,
  event.invitees = req.body.invitees,
  event.attendees = req.body.attendees,
  event.property = req.body.property
  return await event.save(req);
}


async function patch(Id, req) {
  var event = await Event.findById(Id);
  event._original = event.toObject();
  
  if (req.body.title) event.title = req.body.title; 
  if (req.body.attendeeids) event.attendeeids = req.body.attendeeids;
  
  return await event.save(req);
}


async function remove(Id, req) {
  var event = await Event.findById(Id);
  event.status = "deleted"
  return await event.save(req);
}

async function filter(params) {
  return await Event.getbyfilter(params)
}

async function filterview(params) {
  return await Eventview.getfilterview(params)
}

async function findcount(req) {
  return await Event.findcount(req)
}

async function exportdata(params) {
  return await Event.exportdata(params)
}
