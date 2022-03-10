const express = require('express');
const asyncHandler = require('express-async-handler');
const analyticsreportCtrl = require('../controllers/analyticsreport.controller');
const commonCtrl = require('../controllers/common.controller');
const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))

router.route('/')
  .post(asyncHandler(insert))

router.route('/:Id')
  .put(asyncHandler(update))
  .patch(asyncHandler(patch))
  .get(asyncHandler(findbyId))

router.route('/filter')
.post(asyncHandler(findcount), asyncHandler(filter), commonCtrl.exportcsv)

router.route('/process')
  .post(asyncHandler(analyticsreportCtrl.generateanalyticsreport));

async function findbyId(req, res) {
  let analyticsreport = await analyticsreportCtrl.findbyId(req.params.Id);
  res.json(analyticsreport);
}

async function insert(req, res) {
  let analyticsreport = await analyticsreportCtrl.insert(req);
  res.json(analyticsreport);
}

async function update(req, res) {
  let analyticsreport = await analyticsreportCtrl.update(req.params.Id, req);
  res.json(analyticsreport);
}

async function patch(req, res) {
  let analyticsreport = await analyticsreportCtrl.patch(req.params.Id, req);
  res.json(analyticsreport);
}

async function filter(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "analyticsreport";
  let analyticsreports = await analyticsreportCtrl.filter(req.body);
  if (req.body.export) {
    req.body.data = analyticsreports;
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = analyticsreports;
    next()
  }
  else res.json(analyticsreports);
}

async function findcount(req, res, next) {
  if (req.body.size){
    await analyticsreportCtrl.findcount(req);
    res.header("access-control-expose-headers", "error, totalPages, totalCount");
    res.setHeader("error", req.header.error);
    res.setHeader("totalPages", req.header.totalPages);
    res.setHeader("totalCount", req.header.totalCount);
    next();
  }
  else next()
}

