const Joi = require('joi');
const Paymentitem = require('../models/paymentitem.model');

const paymentitemSchema = Joi.object({
  paymentitemname: Joi.string().required(),
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
  return await Paymentitem.findById(Id);
}

async function insert(req) {

  var paymentitem = {
    paymentitemname: req.body.paymentitemname,
    property: req.body.property
  }
  paymentitem = await Joi.validate(paymentitem, paymentitemSchema, { abortEarly: false });
  return await new Paymentitem(paymentitem).save(req);
}

async function update(Id, req) {
  var paymentitem = await Paymentitem.findById(Id);
  paymentitem._original = paymentitem.toObject();
  paymentitem.paymentitemname = req.body.paymentitemname,
  paymentitem.property = req.body.property
  return await paymentitem.save(req);
}

async function remove(Id, req) {
  var paymentitem = await Paymentitem.findById(Id);
  paymentitem.status = "deleted"
  return await paymentitem.save(req);
}

async function filter(params) {
  return await Paymentitem.getbyfilter(params)
}

async function findcount(req) {
  return await Paymentitem.findcount(req)
}

async function exportdata(params) {
  return await Paymentitem.exportdata(params)
}
