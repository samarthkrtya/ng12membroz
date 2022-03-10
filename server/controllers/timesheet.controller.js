// const bcrypt = require('bcrypt');
const Joi = require('joi');
const Timesheet = require('../models/timesheet.model');

const timesheetSchema = Joi.object({
  userid: Joi.string().hex().required(),
  fromdate: Joi.date().required(),
  todate: Joi.date().required(),
  tasks: Joi.array(),
  totalminutes: Joi.number().required(),
  notes: Joi.string(),
  property: Joi.object(),
  status: Joi.string()
})


module.exports = {
  insert,
  update,
  remove,
  filter,
  findcount,
  findbyId,
  exportdata
}

async function findbyId(Id) {
  return await Timesheet.findById(Id);
}

async function insert(req) {
  var timesheet = {
    userid: req.body.userid,
    fromdate: req.body.fromdate,
    todate: req.body.todate,
    tasks: req.body.tasks,
    totalminutes: req.body.totalminutes,
    notes: req.body.notes,
    property: req.body.property,
    status: req.body.status
  }
  timesheet = await Joi.validate(timesheet, timesheetSchema, { abortEarly: false });
  return await new Timesheet(timesheet).save(req);
}

async function update(Id, req) {
  var timesheet = await Timesheet.findById(Id);
  timesheet._original = timesheet.toObject();
  timesheet.userid = req.body.userid,
  timesheet.fromdate = req.body.fromdate,
  timesheet.todate = req.body.todate,
  timesheet.tasks = req.body.tasks,
  timesheet.totalminutes = req.body.totalminutes,
  timesheet.notes = req.body.notes,
  timesheet.property = req.body.property
  timesheet.status = req.body.status
  return await timesheet.save(req);
}

async function remove(Id, req) {
  var timesheet = await Timesheet.findById(Id);
  timesheet.status = "deleted"
  return await timesheet.save(req);
}

async function filter(params) {
  return await Timesheet.getbyfilter(params)
}

async function findcount(req) {
  return await Timesheet.findcount(req)
}

async function exportdata(params) {
  return await Timesheet.exportdata(params)
}
