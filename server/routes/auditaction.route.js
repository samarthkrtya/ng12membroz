const express = require('express');
const asyncHandler = require('express-async-handler');
const auditactionCtrl = require('../controllers/auditaction.controller');
const commonCtrl = require('../controllers/common.controller');
const dashboardCtrl = require('../controllers/dashboard.controller');
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
  .post(asyncHandler(filter),  commonCtrl.deepobjectsearch_like);

router.route('/view/filter')
  .post(asyncHandler(findcount), asyncHandler(viewfilter), commonCtrl.exportcsv)

async function findbyId(req, res) {
  let auditaction = await auditactionCtrl.findbyId(req.params.Id);
  res.json(auditaction);
}

async function insert(req, res) {
  let auditaction = await auditactionCtrl.insert(req);
  res.json(auditaction);
}

async function update(req, res) {
  let auditaction = await auditactionCtrl.update(req.params.Id, req);
  res.json(auditaction);
}

async function remove(req, res) {
  let auditaction = await auditactionCtrl.remove(req.params.Id, req);
  res.json(auditaction);
}

async function findcount(req, res, next) {
  req.body.formname = req.body.formname ? req.body.formname : "syslog";
  if (req.body.size) {
    if (req.body.webpartid) {
      let ids = await dashboardCtrl.webpartfilter(req);
      req.body.search = [{ "searchfield": "_id", "searchvalue": ids, "datatype": "ObjectId", "criteria": "in" }]
    }
    await auditactionCtrl.findcount(req);
    res.header("access-control-expose-headers", "error, totalPages, totalCount");
    res.setHeader("error", req.header.error);
    res.setHeader("totalPages", req.header.totalPages);
    res.setHeader("totalCount", req.header.totalCount);
    next();
  }
  else next()
}

async function filter(req, res, next) {
  req.body.formname = req.body.formname ? req.body.formname : "syslog";
  if (req.body.webpartid) {
    let ids = await dashboardCtrl.webpartfilter(req);
    req.body.search = [{ "searchfield": "_id", "searchvalue": ids, "datatype": "ObjectId", "criteria": "in" }]
  }
  let auditactions = await auditactionCtrl.filter(req.body);
  if (req.body.export) {
    req.body.data = auditactions
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = auditactions
    next()
  }
  else res.json(auditactions);
}

async function viewfilter(req, res, next) {
  req.body.formname = req.body.formname ? req.body.formname : "syslog";
  var viewname = req.body.viewname;
  let auditactions;
  if (viewname) {
    auditactions = await commonCtrl.viewfilter(req, res);
  }
  else {
    auditactions = await auditactionCtrl.viewfilter(req.body);
  }
  if (req.body.export) {
    req.body.data = auditactions
    next()
  }  
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = auditactions
    next()
  }
  else res.json(auditactions);
}