// const bcrypt = require('bcrypt');
const Joi = require('joi');
const Payroll = require('../models/payroll.model');
const Formfield = require('../models/formfield.model');
const Salaryslipview = require('../views/salaryslip.view');
var MongoClient = require('mongodb').MongoClient;
var url = process.env.MONGO_HOST;

const payrollSchema = Joi.object({
  month: Joi.number().required(),
  year: Joi.number().required(),
  paymentdate: Joi.date().required(),
  workingdays: Joi.number().required(),
  weeklyoffdays: Joi.number().required(),
  holidays: Joi.number().required(),
  payrollcost: Joi.number().required(),
  payrollnetpay: Joi.number().required(),
  taxes: Joi.number().required(),
  pretaxdeductions: Joi.number().required(),
  posttaxdeductions: Joi.number().required(),
  employeesalary: Joi.array(),
  property: Joi.object()
})


module.exports = {
  insert,
  update,
  remove,
  filter,
  findcount,
  findbyId,
  getemployeepayroll,
  exportdata,
  usersalaryview,
  findbySalaryId
}

async function findbyId(Id) {
  return await Payroll.findById(Id);
}

async function findbySalaryId(Id) {
  return await Salaryslipview.findById(Id);
}

async function insert(req) {
  var payroll = {
    month: req.body.month,
    year: req.body.year,
    paymentdate: req.body.paymentdate,
    workingdays: req.body.workingdays,
    weeklyoffdays: req.body.weeklyoffdays,
    holidays: req.body.holidays,
    payrollcost: req.body.payrollcost,
    payrollnetpay: req.body.payrollnetpay,
    taxes: req.body.taxes,
    pretaxdeductions: req.body.pretaxdeductions,
    posttaxdeductions: req.body.posttaxdeductions,
    employeesalary: req.body.employeesalary,
    property: req.body.property
  }
  payroll = await Joi.validate(payroll, payrollSchema, { abortEarly: false });
  return await new Payroll(payroll).save(req);
}

async function update(Id, req) {
  var payroll = await Payroll.findById(Id);
  payroll._original = payroll.toObject();

  payroll.status = req.body.status,
    payroll.month = req.body.month,
    payroll.year = req.body.year,
    payroll.paymentdate = req.body.paymentdate,
    payroll.workingdays = req.body.workingdays,
    payroll.weeklyoffdays = req.body.weeklyoffdays,
    payroll.holidays = req.body.holidays,
    payroll.payrollcost = req.body.payrollcost,
    payroll.payrollnetpay = req.body.payrollnetpay,
    payroll.taxes = req.body.taxes,
    payroll.pretaxdeductions = req.body.pretaxdeductions,
    payroll.posttaxdeductions = req.body.posttaxdeductions,
    payroll.employeesalary = req.body.employeesalary,
    payroll.property = req.body.property
  return await payroll.save(req);
}

async function remove(Id, req) {
  var payroll = await Payroll.findById(Id);
  payroll.status = "deleted"
  return await payroll.save(req);
}

async function filter(params) {
  return await Payroll.getbyfilter(params)
}

async function findcount(req) {
  return await Payroll.findcount(req)
}

async function exportdata(params) {
  return await Payroll.exportdata(params)
}

async function getemployeepayroll(req, res, next) {
  var employeeid = req.params.employeeid;

  Payroll.getemployeepayroll(employeeid)
    .then((payrolls) => {
      res.json(payrolls)
    })
    .catch(e => next(e));
}

async function usersalaryview(params) {
  return await Salaryslipview.getfilterview(params)
}
