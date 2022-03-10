const express = require('express');
const asyncHandler = require('express-async-handler');
const serviceCtrl = require('../controllers/service.controller');
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
  let service = await serviceCtrl.findbyId(req.params.Id);
  res.json(service);
}

async function insert(req, res) {
  let service = await serviceCtrl.insert(req);
  res.json(service);
}

async function update(req, res) {
  let service = await serviceCtrl.update(req.params.Id, req);
  res.json(service);
}

async function remove(req, res) {
  let service = await serviceCtrl.remove(req.params.Id, req);
  res.json(service);
}

async function findcount(req, res, next) {
  if (req.body.size){
    await serviceCtrl.findcount(req);
    res.header("access-control-expose-headers", "error, totalPages, totalCount");
    res.setHeader("error", req.header.error);
    res.setHeader("totalPages", req.header.totalPages);
    res.setHeader("totalCount", req.header.totalCount);
    next();
  }
  else next()
}

async function filter(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "service";
  let services = await serviceCtrl.filter(req.body);
  if (req.body.export) {
    req.body.data = services
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = services
    next()
  }
  else res.json(services);
}

