const Joi = require('joi');
const Weekschedule = require('../models/weekschedule.model');
const Weekscheduleview = require('../views/weekschedule.view');

const weekscheduleSchema = Joi.object({
  title: Joi.string(),
  type: Joi.string(),
  formid: Joi.string().hex(),
  scheduleformid: Joi.string().hex(),
  memberid: Joi.string().hex(),
  schedule: Joi.array(),
  property: Joi.object()
})


module.exports = {
  insert,
  update,
  patch,
  remove,
  filter, 
  findcount,
  filterview,
  findbyId,
  exportdata
}

async function findbyId(Id) {
  return await Weekschedule.findById(Id);
}

async function insert(req) {
  var weekschedule = {
    title: req.body.title,
    type: req.body.type,
    formid: req.body.formid,
    scheduleformid: req.body.scheduleformid,
    memberid: req.body.memberid,
    schedule: req.body.schedule,
    property: req.body.property,
  }
  weekschedule = await Joi.validate(weekschedule, weekscheduleSchema, { abortEarly: false });
  return await new Weekschedule(weekschedule).save(req);
}

async function patch(Id, req) {
  var weekschedule = await Weekschedule.findById(Id);
  weekschedule._original = weekschedule.toObject();

  if (req.body.title) weekschedule.title = req.body.title;
  if (req.body.type) weekschedule.type = req.body.type;
  if (req.body.formid) weekschedule.formid = req.body.formid;
  if (req.body.scheduleformid) weekschedule.formid = req.body.scheduleformid;
  if (req.body.memberid) weekschedule.memberid = req.body.memberid;
  
  if (req.body.schedule) weekschedule.schedule = req.body.schedule;
  
  
  return await weekschedule.save(req);
}


async function update(Id, req) {
  var weekschedule = await Weekschedule.findById(Id);
  weekschedule._original = weekschedule.toObject();
  weekschedule.title = req.body.title,
  weekschedule.type = req.body.type,
  weekschedule.formid = req.body.formid,
  weekschedule.scheduleformid = req.body.scheduleformid,
  weekschedule.memberid = req.body.memberid,
  
  weekschedule.schedule = req.body.schedule,
  weekschedule.property = req.body.property
  return await weekschedule.save(req);
}

async function remove(Id, req) {
  var weekschedule = await Weekschedule.findById(Id);
  weekschedule.status = "deleted"
  return await weekschedule.save(req);
}

async function filter(params) {
  return await Weekschedule.getbyfilter(params)
}

async function filterview(params) {
  return await Weekscheduleview.getbyfilter(params)
}

async function findcount(req) {
  return await Weekschedule.findcount(req)
}

async function exportdata(params) {
  return await Weekschedule.exportdata(params)
}
