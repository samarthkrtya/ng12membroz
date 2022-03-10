const express = require('express');
const asyncHandler = require('express-async-handler');
const bireportCtrl = require('../controllers/bireport.controller');
const analyticsreportCtrl = require('../controllers/analyticsreport.controller');
const commonCtrl = require('../controllers/common.controller');
const router = express.Router();
module.exports = router;

router.route('/')
  .post(asyncHandler(insert))

router.route('/:Id')
  .put(asyncHandler(update))
  .delete(asyncHandler(remove))
  .patch(asyncHandler(patch))
  .get(asyncHandler(findbyId))

router.route('/filter')
  .post(asyncHandler(findcount), asyncHandler(filter), commonCtrl.exportcsv)

router.route('/view/:Id')
  .post(asyncHandler(findbyIdview),  asyncHandler(getDynamicFields), asyncHandler(reportview), commonCtrl.exportcsv)

router.route('/chartreport/:Id')
.post(asyncHandler(findbyIdview), asyncHandler(chartreport), commonCtrl.exportcsv)

router.route('/search/')
  .post(asyncHandler(filter),  commonCtrl.deepobjectsearch_like);

async function findbyId(req, res) {
  let bireport = await bireportCtrl.findbyId(req.params.Id);
  res.json(bireport);
}

async function insert(req, res) {
  let bireport = await bireportCtrl.insert(req);
  res.json(bireport);
}

async function patch(req, res) {
  let bireport = await bireportCtrl.patch(req.params.Id, req);
  res.json(bireport);
}

async function update(req, res) {
  let bireport = await bireportCtrl.update(req.params.Id, req);
  res.json(bireport);
}

async function remove(req, res) {
  let bireport = await bireportCtrl.remove(req.params.Id, req);
  res.json(bireport);
}

async function findcount(req, res, next) {
  if (req.body.size){
    await bireportCtrl.findcount(req);
    res.header("access-control-expose-headers", "error, totalPages, totalCount");
    res.setHeader("error", req.header.error);
    res.setHeader("totalPages", req.header.totalPages);
    res.setHeader("totalCount", req.header.totalCount);
    next();
  }
  else next()
}

async function filter(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "bireport";
  let bireports = await bireportCtrl.filter(req.body);
  if (req.body.export) {
    req.body.data = bireports
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = bireports
    next()
  }
  else res.json(bireports);
}

async function reportview(req, res, next) {
  let content = await bireportCtrl.reportview(req, res);
  if (req.body.export) {
    req.body.data = content;
    next()
  }
  else res.json(content);

}


async function chartreport(req, res, next) {
  let content = await bireportCtrl.chartreport(req, res);
  if (req.body.exports) next()
  else res.json(content);

}

async function findbyIdview(req, res, next) {
  let report = await bireportCtrl.findbyId(req.params.Id);
  req.body.report = report;
  req.body.analyticreport = report.analyticid;
  req.body.analyticfields = report.analyticidfields;
  next();
}

async function getDynamicFields(req, res, next) {
  if(req.body.analyticfields){
    let report = await bireportCtrl.getDynamicFields(req);
    next();
  }
  else{
    next();
  }
}
