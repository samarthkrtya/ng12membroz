const express = require('express');
const asyncHandler = require('express-async-handler');
const lookupCtrl = require('../controllers/lookup.controller');
const commonCtrl = require('../controllers/common.controller');
const router = express.Router();
module.exports = router;

router.route('/')
  .post(asyncHandler(insert))
  .get(asyncHandler(filter))

router.route('/:Id')
  .put(asyncHandler(update))
  .patch(asyncHandler(patch))
  .get(asyncHandler(findbyId))

router.route('/filter')
.post(asyncHandler(findcount), asyncHandler(filter), commonCtrl.exportcsv)

async function findbyId(req, res) {
  let lookup = await lookupCtrl.findbyId(req.params.Id);
  res.json(lookup);
}

async function insert(req, res) {
  let lookup = await lookupCtrl.insert(req);
  res.json(lookup);
}

async function patch(req, res) {
  let lookup = await lookupCtrl.patch(req.params.Id, req);
  res.json(lookup);
}

async function update(req, res) {
  let lookup = await lookupCtrl.update(req.params.Id, req);
  res.json(lookup);
}

async function filter(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "lookup";
  let lookups = await lookupCtrl.filter(req.body);
  if (req.body.export) {
    req.body.data = lookups
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = lookups
    next()
  }
  else res.json(lookups);
}

async function findcount(req, res, next) {
  if (req.body.size){
    await lookupCtrl.findcount(req);
    res.header("access-control-expose-headers", "error, totalPages, totalCount");
    res.setHeader("error", req.header.error);
    res.setHeader("totalPages", req.header.totalPages);
    res.setHeader("totalCount", req.header.totalCount);
    next();
  }
  else next()
}
