const Joi = require('joi');
const Lookup = require('../models/lookup.model');

const lookupSchema = Joi.object({
  lookup: Joi.string().required(),
  property: Joi.object()
})


module.exports = {
  insert,
  update,
  patch,
  filter,
  findbyId,
  findcount,
  exportdata
}

async function findbyId(Id) {
  return await Lookup.findById(Id);
}

async function patch(Id, req) {
  var lookup = await Lookup.findById(Id);
  lookup._original = lookup.toObject();
  if (req.body.data) lookup.data = req.body.data;
  if (req.body.object) lookup.data.push(req.body.object);

  return await new Lookup(lookup).save(req);
}
async function insert(req) {
  var lookup = {
    lookup: req.body.lookup,
    property: req.body.property
  }
  lookup = await Joi.validate(lookup, lookupSchema, { abortEarly: false });
  return await new Lookup(lookup).save(req);
}

async function update(Id, req) {
  var lookup = await Lookup.findById(Id);
  lookup._original = lookup.toObject();
  lookup.lookup = req.body.lookup;
  lookup.property = req.body.property;
  return await lookup.save(req);
}

async function filter(req) {
  return await Lookup.getbyfilter(req)
}

async function findcount(params) {
  return await Lookup.findcount(params)
}

async function exportdata(params) {
  return await Lookup.exportdata(params)
}
