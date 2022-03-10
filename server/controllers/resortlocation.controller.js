const Joi = require('joi');
const Resortlocation = require('../models/resortlocation.model');

const resortlocationSchema = Joi.object({
  property: Joi.object(),
  locationname: Joi.string()
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
  return await Resortlocation.findById(Id);
}

async function insert(req) {
  var resortlocation = {
    property: req.body.property,
    locationname: req.body.locationname
  }
  await Joi.validate(resortlocation, resortlocationSchema, { abortEarly: false });
  return await new Resortlocation(resortlocation).save(req);
}

async function update(Id, req) {
  var resortlocation = await Resortlocation.findById(Id);
  resortlocation._original = resortlocation.toObject();
  resortlocation.property = req.body.property,
  resortlocation.locationname = req.body.locationname
  return await resortlocation.save(req);
}

async function remove(Id, req) {
  var resortlocation = await Resortlocation.findById(Id);
  resortlocation.status = "deleted"
  return await resortlocation.save(req);
}

async function filter(params) {
  return await Resortlocation.getbyfilter(params)
}

async function findcount(req) {
  return await Resortlocation.findcount(req)
}

async function exportdata(params) {
  return await Resortlocation.exportdata(params)
}
