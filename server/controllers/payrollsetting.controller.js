// const bcrypt = require('bcrypt');
const Joi = require('joi');
const Payrollsetting = require('../models/payrollsetting.model');

const payrollsettingSchema = Joi.object({
  frequency: Joi.string().required(),
  closingday: Joi.number(),
  endingday: Joi.number(),
  commission: Joi.object(),
  service: Joi.object(),
  membership: Joi.object(),
  property: Joi.object()
})


module.exports = {
  insert,
  update,
  patch,
  remove,
  filter,
  findcount,
  findbyId,
  exportdata
}

async function findbyId(Id) {
  return await Payrollsetting.findById(Id);
}

async function insert(req) {
  var payrollsetting = {
    frequency: req.body.frequency,
    closingday: req.body.closingday,
    endingday: req.body.endingday,
    commission: req.body.commission,
    service: req.body.service,
    membership: req.body.membership,
    property: req.body.property
  }
  payrollsetting = await Joi.validate(payrollsetting, payrollsettingSchema, { abortEarly: false });
  return await new Payrollsetting(payrollsetting).save(req);
}

async function update(Id, req) {
  var payrollsetting = await Payrollsetting.findById(Id);
  payrollsetting._original = payrollsetting.toObject();
  payrollsetting.frequency = req.body.frequency,
  payrollsetting.closingday = req.body.closingday,
  payrollsetting.endingday = req.body.endingday,
  payrollsetting.commission = req.body.commission,
  payrollsetting.service = req.body.service,
  payrollsetting.membership = req.body.membership,
  payrollsetting.property = req.body.property
  return await payrollsetting.save(req);
}


async function patch(Id, req) {
  var payrollsetting = await Payrollsetting.findById(Id);
  payrollsetting._original = payrollsetting.toObject();
  if (req.body.commissiontype) payrollsetting.commissiontype = req.body.commissiontype;
  if (req.body.membership) payrollsetting.membership = req.body.membership;
  if (req.body.service) payrollsetting.service = req.body.service;
  if (req.body.tier) payrollsetting.tier = req.body.tier;
  if (req.body.commission) payrollsetting.commission = req.body.commission;
  if (req.body.revenuecomponent) payrollsetting.revenuecomponent = req.body.revenuecomponent;
  if (req.body.property) payrollsetting.property = req.body.property;

  return await payrollsetting.save(req);
}

async function remove(Id, req) {
  var payrollsetting = await Payrollsetting.findById(Id);
  payrollsetting.status = "deleted"
  return await payrollsetting.save(req);
}

async function filter(params) {
  return await Payrollsetting.getbyfilter(params)
}

async function findcount(req) {
  return await Payrollsetting.findcount(req)
}

async function exportdata(params) {
  return await Payrollsetting.exportdata(params)
}
