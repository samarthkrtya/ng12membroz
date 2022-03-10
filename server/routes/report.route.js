const express = require('express');
const asyncHandler = require('express-async-handler');
const reportCtrl = require('../controllers/report.controller');
const bireportCtrl = require('../controllers/bireport.controller');
const commonCtrl = require('../controllers/common.controller');
const roleCtrl = require('../controllers/role.controller');
const router = express.Router();
module.exports = router;

router.route('/')
  .post(asyncHandler(insert), asyncHandler(updaterolepermission))

router.route('/:Id')
  .put(asyncHandler(update))
  .delete(asyncHandler(remove))
  .patch(asyncHandler(patch))
  .get(asyncHandler(findbyId))

router.route('/filter')
  .post(asyncHandler(findcount), asyncHandler(filter), commonCtrl.exportcsv)

router.route('/filter/all')
  .post(asyncHandler(filterreport), asyncHandler(filterbireport),)



router.route('/filter/view')
  .post(asyncHandler(filterview))

router.route('/view/:Id')
  .post(asyncHandler(findbyIdview), asyncHandler(reportview), commonCtrl.exportcsv)

router.route('/search/')
  .post(asyncHandler(filter),  commonCtrl.deepobjectsearch_like);

async function findbyId(req, res) {
  let report = await reportCtrl.findbyId(req.params.Id);
  res.json(report);
}

async function insert(req, res, next) {
  let report = await reportCtrl.insert(req);
  req.body.report = report;
  next()
}

async function patch(req, res) {
  let report = await reportCtrl.patch(req.params.Id, req);
  res.json(report);
}

async function updaterolepermission(req, res) {
  var roleid = req.body.authkey.role._id;
  req.body.reportpermissions = req.body.report._id
  await roleCtrl.patch(roleid, req)
  res.json(req.body.report)
}

async function update(req, res) {
  let report = await reportCtrl.update(req.params.Id, req);
  res.json(report);
}

async function remove(req, res) {
  let report = await reportCtrl.remove(req.params.Id, req);
  res.json(report);
}

async function findcount(req, res, next) {
  if (req.body.size){
    await reportCtrl.findcount(req);
    res.header("access-control-expose-headers", "error, totalPages, totalCount");
    res.setHeader("error", req.header.error);
    res.setHeader("totalPages", req.header.totalPages);
    res.setHeader("totalCount", req.header.totalCount);
    next();
  }
  else next()
}

async function filterreport(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "report";
  let reports = await reportCtrl.filter(req.body);
  req.body.reports = reports
  next();
}

async function filterbireport(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "bireport";
  let bireports = await bireportCtrl.filter(req.body);
  var reports = req.body.reports;
  res.json(reports.concat(bireports));
}

async function filter(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "report";
  let reports = await reportCtrl.filter(req.body);
  if (req.body.export) {
    req.body.data = reports
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = reports
    next()
  }
  else res.json(reports);
}

async function filterview(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "report";
  //console.log(req.body)
  let reports = await reportCtrl.filterview(req.body);
  res.json(reports);
}


async function reportview(req, res, next) {

  let content = await reportCtrl.reportview(req, res);
  if (req.body.export) {
    req.body.data = content;
    next()
  }
  else res.json(content);

}

async function findbyIdview(req, res, next) {
  let report = await reportCtrl.findbyId(req.params.Id);
  req.body.report = report;
  next();
}
