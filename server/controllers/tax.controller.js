const Joi = require('joi');
const Tax = require('../models/tax.model');

const taxSchema = Joi.object({
  taxname: Joi.string().required(),
  amount: Joi.number().required(),
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
  return await Tax.findById(Id);
}

async function insert(req) {
  var tax = {
    taxname: req.body.taxname,
    amount: req.body.amount,
    property: req.body.property,
  }
  tax = await Joi.validate(tax, taxSchema, { abortEarly: false });
  return await new Tax(tax).save(req);
}

async function update(Id, req) {
  var body = req.body;
  var tax = await Tax.findById(Id);
  tax._original = tax.toObject();
  tax.taxname = body.taxname,
  tax.amount = body.amount,
  tax.property= body.property
  return await tax.save(req);
}

async function remove(Id, req) {
  var tax = await Tax.findById(Id);
  tax.status = "deleted"
  return await tax.save(req);
}

async function filter(params) {
  return await Tax.getbyfilter(params)
}

async function findcount(req) {
  return await Tax.findcount(req)
}

async function exportdata(params) {
  return await Tax.exportdata(params)
}
