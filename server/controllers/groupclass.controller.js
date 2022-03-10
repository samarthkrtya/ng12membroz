const Joi = require('joi');
const Groupclass = require('../models/groupclass.model');
const Groupclassview = require('../views/groupclass.view');

const groupclassSchema = Joi.object({
  title: Joi.string().required(),
  assigneeuser: Joi.string().hex(),
  members: Joi.array(),
  waitings: Joi.array(),
  property: Joi.object().required()
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
  return await Groupclass.findById(Id);
}

async function insert(req) {
  var groupclass = {
    title: req.body.title,
    assigneeuser: req.body.assigneeuser,
    members: req.body.members,
    waitings: req.body.waitings,
    property: req.body.property,
  }
  await Joi.validate(groupclass, groupclassSchema, { abortEarly: false });
  return await new Groupclass(groupclass).save(req);
}

async function patch(Id, req) {
  var groupclass = await Groupclass.findById(Id);
  groupclass._original = groupclass.toObject();

  if(req.body.title) groupclass.title = req.body.title;
  if(req.body.members) groupclass.members = req.body.members;

  return await groupclass.save(req);
}

async function update(Id, req) {
  var groupclass = await Groupclass.findById(Id);
  groupclass._original = groupclass.toObject();
  groupclass.title = req.body.title,
  groupclass.assigneeuser = req.body.assigneeuser,
  groupclass.members = req.body.members,
  groupclass.waitings = req.body.waitings,
  groupclass.property = req.body.property
  return await groupclass.save(req);
}

async function remove(Id, req) {
  var groupclass = await Groupclass.findById(Id);
  groupclass.status = "deleted"
  return await groupclass.save(req);
}

async function filter(params) {
  return await Groupclass.getbyfilter(params)
}

async function filterview(params) {
  return await Groupclassview.getfilterview(params)
}

async function findcount(req) {
  return await Groupclass.findcount(req)
}

async function exportdata(params) {
  return await Groupclass.exportdata(params)
}
