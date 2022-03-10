// const bcrypt = require('bcrypt');
const Joi = require('joi');
const Designation = require('../models/designation.model');

const designationSchema = Joi.object({
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
  return await Designation.findById(Id);
}

async function insert(req) {
  var designation = {
    title: req.body.title,
    property: req.body.property
  }
  designation = await Joi.validate(designation, designationSchema, { abortEarly: false });
  return await new Designation(designation).save(req);
}

async function update(Id, req) {
  var designation = await Designation.findById(Id);
  designation._original = designation.toObject();
  designation.title = req.body.title,
  designation.property = req.body.property
  return await designation.save(req);
}

async function remove(Id, req) {
  var designation = await Designation.findById(Id);
  designation.status = "deleted"
  return await designation.save(req);
}

async function filter(params) {
  return await Designation.getbyfilter(params)
}

async function findcount(req) {
  return await Designation.findcount(req)
}

async function exportdata(params) {
  return await Designation.exportdata(params)
}
