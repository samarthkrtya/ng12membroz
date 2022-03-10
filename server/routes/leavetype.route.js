const express = require('express');
const asyncHandler = require('express-async-handler');
const leavetypeCtrl = require('../controllers/leavetype.controller');
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
  let leavetype = await leavetypeCtrl.findbyId(req.params.Id);
  res.json(leavetype);
}

async function insert(req, res) {
  let leavetype = await leavetypeCtrl.insert(req);
  res.json(leavetype);
}

async function update(req, res) {
  let leavetype = await leavetypeCtrl.update(req.params.Id, req);
  res.json(leavetype);
}

async function remove(req, res) {
  let leavetype = await leavetypeCtrl.remove(req.params.Id, req);
  res.json(leavetype);
}

async function findcount(req, res, next) {
  if (req.body.size){
    await leavetypeCtrl.findcount(req);
    res.header("access-control-expose-headers", "error, totalPages, totalCount");
    res.setHeader("error", req.header.error);
    res.setHeader("totalPages", req.header.totalPages);
    res.setHeader("totalCount", req.header.totalCount);
    next();
  }
  else next()
}

async function filter(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "leavetype";
  let leavetypes = await leavetypeCtrl.filter(req.body);
  if (req.body.export) {
    req.body.data = leavetypes
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = leavetypes
    next()
  }
  else res.json(leavetypes);
}

