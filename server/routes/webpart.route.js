const express = require('express');
const asyncHandler = require('express-async-handler');
const webpartCtrl = require('../controllers/webpart.controller');
const commonCtrl = require('../controllers/common.controller');
const router = express.Router();
module.exports = router;

router.route('/')
  .get(asyncHandler(findAll))

router.route('/:Id')
  .get(asyncHandler(findbyId))

router.route('/filter')
.post(asyncHandler(findcount), asyncHandler(filter), commonCtrl.exportcsv)

async function findbyId(req, res, next) {
  let webpart = await webpartCtrl.findbyId(req.params.Id, req);
  req.body.data = webpart;
  if (req.body.matches) next();
  else res.json(webpart);
}

async function findAll(req, res, next) {
  let webparts = await webpartCtrl.findAll();
  res.json(webparts);
}

async function filter(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "webpart";
  let webparts = await webpartCtrl.filter(req.body);
  if (req.body.export) {
    req.body.data = webparts
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = webparts
    next()
  }
  else res.json(webparts);
}

async function findcount(req, res, next) {
  if (req.body.size){
    await webpartCtrl.findcount(req);
    res.header("access-control-expose-headers", "error, totalPages, totalCount");
    res.setHeader("error", req.header.error);
    res.setHeader("totalPages", req.header.totalPages);
    res.setHeader("totalCount", req.header.totalCount);
    next();
  }
  else next()
}
