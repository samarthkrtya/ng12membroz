const Joi = require('joi');
const Resort = require('../models/resort.model');

const resortSchema = Joi.object({
  property: Joi.object(),
  resortname: Joi.string(),
  location: Joi.string().hex().required()
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
  return await Resort.findById(Id);
}

async function insert(req) {
  var resort = {
    property: req.body.property,
    resortname: req.body.resortname,
    location: req.body.location,
  }
  await Joi.validate(resort, resortSchema, { abortEarly: false });
  return await new Resort(resort).save(req);
}

async function update(Id, req) {
  var resort = await Resort.findById(Id);
  resort._original = resort.toObject();
  resort.property = req.body.property,
  resort.resortname = req.body.resortname,
  resort.tariff = req.body.tariff,
  resort.location = req.body.location
  return await resort.save(req);
}

async function remove(Id, req) {
  var resort = await Resort.findById(Id);
  resort.status = "deleted"
  return await resort.save(req);
}

async function filter(params) {
  return await Resort.getbyfilter(params)
}

async function findcount(req) {
  return await Resort.findcount(req)
}

async function exportdata(params) {
  return await Resort.exportdata(params)
}
