// const bcrypt = require('bcrypt');
const Joi = require('joi');
const Leavetype = require('../models/leavetype.model');

const leavetypeSchema = Joi.object({
  title: Joi.string().required(),
  title: Joi.string().required(),
  property: Joi.object()
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
  return await Leavetype.findById(Id);
}

async function insert(req) {
  var leavetype = {
    title: req.body.title,
    property: req.body.property
  }
  leavetype = await Joi.validate(leavetype, leavetypeSchema, { abortEarly: false });
  return await new Leavetype(leavetype).save(req);
}

async function update(Id, req) {
  var leavetype = await Leavetype.findById(Id);
  leavetype._original = leavetype.toObject();
  leavetype.title = req.body.title,
  leavetype.property = req.body.property
  return await leavetype.save(req);
}

async function remove(Id, req) {
  var leavetype = await Leavetype.findById(Id);
  leavetype.status = "deleted"
  return await leavetype.save(req);
}

async function filter(params) {
  return await Leavetype.getbyfilter(params)
}

async function findcount(req) {
  return await Leavetype.findcount(req)
}

async function exportdata(params) {
  return await Leavetype.exportdata(params)
}
