const express = require('express');
const asyncHandler = require('express-async-handler');
const payrollCtrl = require('../controllers/payroll.controller');
const analyticsreportCtrl = require('../controllers/analyticsreport.controller');
const commonCtrl = require('../controllers/common.controller');
const createHTML = require('../helpers/createHTML');
const templateCtrl = require('../controllers/template.controller');
const Salaryslipview = require('../views/salaryslip.view');
const router = express.Router();
module.exports = router;

router.route('/')
  .post(asyncHandler(insert))

router.route('/:Id')
  .put(asyncHandler(update))
  .delete(asyncHandler(remove))
  .get(asyncHandler(findbyId))

router.route('/filter')
  .post(asyncHandler(findcount), asyncHandler(filter), commonCtrl.exportcsv)

router.route('/search/')
  .post(asyncHandler(filter), commonCtrl.deepobjectsearch_like);

router.route('/process')
  .post(asyncHandler(analyticsreportCtrl.generateanalyticsreport));

router.route('/employee/:employeeid')
  .get(payrollCtrl.getemployeepayroll)

router.route('/generatehtml/:Id')
  .post(asyncHandler(findbytemp), createHTML.getpayrollhtml)

  router.route('/filter/salary/view')
  .post(asyncHandler(usersalaryview))

async function findbyId(req, res) { 
  let payroll = await payrollCtrl.findbyId(req.params.Id);
  res.json(payroll);
}

async function insert(req, res) {
  let payroll = await payrollCtrl.insert(req);
  res.json(payroll);
}

async function update(req, res) {
  let payroll = await payrollCtrl.update(req.params.Id, req);
  res.json(payroll);
}

async function remove(req, res) {
  let payroll = await payrollCtrl.remove(req.params.Id, req);
  res.json(payroll);
}

async function findcount(req, res, next) {
  if (req.body.size) {
    await payrollCtrl.findcount(req);
    res.header("access-control-expose-headers", "error, totalPages, totalCount");
    res.setHeader("error", req.header.error);
    res.setHeader("totalPages", req.header.totalPages);
    res.setHeader("totalCount", req.header.totalCount);
    next();
  }
  else next()
}

async function filter(req, res, next) {
  req.body.formname = req.body.formname ? req.body.formname : "payroll";
  //console.log(req.body)
  let payrolls = await payrollCtrl.filter(req.body);
  if (req.body.export) {
    next(payrolls)
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = payrolls
    next()
  }
  else res.json(payrolls);
}

async function findbytemp(req, res, next) {
  let payrollsalary;
  var formname = req.body.formname;
  req.body.search = [{ "searchfield": "templatetype", "searchvalue": formname, "datatype": "text", "criteria": "eq" }];
  req.body.formname = 'template'
  var template = await templateCtrl.filter(req.body);
  if (template && template.length > 0)
    req.body.template = template[0];
  if (req.body.type == 'salaryslip') {
    payrollsalary = await payrollCtrl.findbySalaryId(req.body.id);
    req.body.payrollsalary = payrollsalary;
  }
  //  else{
  //   tourpackage = await tourpackageCtrl.findbyId(req.body.id);
  //   req.body.tourpackage = tourpackage;
  // }
  next();
}

async function usersalaryview(req, res, next) {
  let salary = await payrollCtrl.usersalaryview(req.body);
  res.json(salary);
}