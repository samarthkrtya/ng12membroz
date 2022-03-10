const express = require('express');
const asyncHandler = require('express-async-handler');
const membershipusageCtrl = require('../controllers/membershipusage.controller');
const commonCtrl = require('../controllers/common.controller');
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

async function findbyId(req, res) {
  let membershipusage = await membershipusageCtrl.findbyId(req.params.Id);
  res.json(membershipusage);
}

async function insert(req, res) {
  let membershipusage = await membershipusageCtrl.insert(req);
  res.json(membershipusage);
}

async function update(req, res) {
  let membershipusage = await membershipusageCtrl.update(req.params.Id, req);
  res.json(membershipusage);
}

async function remove(req, res) {
  let membershipusage = await membershipusageCtrl.remove(req.params.Id, req);
  res.json(membershipusage);
}

async function findcount(req, res, next) {
  if (req.body.size){
    await membershipusageCtrl.findcount(req);
    res.header("access-control-expose-headers", "error, totalPages, totalCount");
    res.setHeader("error", req.header.error);
    res.setHeader("totalPages", req.header.totalPages);
    res.setHeader("totalCount", req.header.totalCount);
    next();
  }
  else next()
}

async function filter(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "membershipusage";
  let membershipusages = await membershipusageCtrl.filter(req.body);
  if (req.body.export) {
    req.body.data = membershipusages
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = membershipusages
    next()
  }
  else res.json(membershipusages);
}

