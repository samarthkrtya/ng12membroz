const Joi = require('joi');
const Paymentterm = require('../models/paymentterm.model');

const paymenttermSchema = Joi.object({
  memberid: Joi.string().hex(),
  membershipid: Joi.string().hex().required(),
  paymentitem: Joi.string().hex().required(),
  period: Joi.string().required(),
  tenure: Joi.number().required(),
  ismembershipfees: Joi.boolean(),
  amount: Joi.number(),
  totalamount: Joi.number(),
  discount: Joi.number(),
  date: Joi.number().allow(null),
  startperiod: Joi.number().allow(null),
  taxes: Joi.array(),
})


module.exports = {
  insert,
  update,
  remove,
  filter,
  findbyId,
  findcount,
  insertpaymentterms
}

async function findbyId(Id) {
  return await Paymentterm.findById(Id);
}

async function insert(req) {
  
  var paymentterm = {
    memberid: req.body.memberid,
    membershipid: req.body.membershipid,
    paymentitem: req.body.paymentitem,
    period: req.body.period,
    tenure: req.body.tenure,
    amount: req.body.amount,
    totalamount: req.body.totalamount,
    ismembershipfees: req.body.ismembershipfees,
    discount: req.body.discount,
    date: req.body.date,
    startperiod: req.body.startperiod,
    taxes: req.body.taxes
  }
  paymentterm = await Joi.validate(paymentterm, paymenttermSchema, { abortEarly: false });
  return await new Paymentterm(paymentterm).save(req);
}

async function insertpaymentterms(req) {
  var membership = req.body.membership;
  var property = req.body.property;
  var paymentterm = {
    membershipid: membership._id,
    paymentitem: property.payment_item,
    period: req.body.property.period ? req.body.property.period : "Once",
    ismembershipfees: true,
    tenure: 1,
    amount: property.cost,
    totalamount: property.cost,
    taxes: property.taxes
  }
  await new Paymentterm(paymentterm).save(req);
  return membership;

}

async function update(Id, req) {
  var body = req.body;
  var paymentterm = await Paymentterm.findById(Id);
  paymentterm._original = paymentterm.toObject();
  paymentterm.memberid = body.memberid,
  paymentterm.membershipid = body.membershipid,
  paymentterm.paymentitem = body.paymentitem,
  paymentterm.period = body.period,
  paymentterm.tenure = body.tenure,
  paymentterm.amount = req.body.amount,
  paymentterm.totalamount = body.totalamount,
  paymentterm.ismembershipfees = body.ismembershipfees,
  paymentterm.discount = body.discount,
  paymentterm.date = body.date,
  paymentterm.startperiod = body.startperiod,
  paymentterm.taxes = body.taxes,
  paymentterm.property = body.property
  return await paymentterm.save(req);
}

async function remove(Id, req) {
  var body = req.body;
  var paymentterm = await Paymentterm.findById(Id);
  paymentterm.status = "deleted"
  return await paymentterm.save(req);
}

async function filter(params) {
  return await Paymentterm.getbyfilter(params)
}

async function findcount(req) {
  return await Paymentterm.findcount(req)
}


