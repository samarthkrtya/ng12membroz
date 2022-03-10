const express = require('express');
const asyncHandler = require('express-async-handler');
const menupermissionCtrl = require('../controllers/menupermission.controller');
const commonCtrl = require('../controllers/common.controller');
const router = express.Router();
module.exports = router;

router.route('/')
  .post(asyncHandler(insert))

router.route('/:Id')
  .put(asyncHandler(update))
  .get(asyncHandler(findbyId))

router.route('/filter')
.post(asyncHandler(findcount), asyncHandler(filter), commonCtrl.exportcsv)

async function findbyId(req, res) {
  let menupermission = await menupermissionCtrl.findbyId(req.params.Id);
  res.json(menupermission);
}

async function insert(req, res) {
  let menupermission = await menupermissionCtrl.insert(req);
  res.json(menupermission);
}

async function update(req, res) {
  let menupermission = await menupermissionCtrl.update(req.params.Id, req);
  res.json(menupermission);
}

async function filter(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "menupermission";
  let menupermissions = await menupermissionCtrl.filter(req.body);
  if (req.body.export) {
    req.body.data = menupermissions
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = menupermissions
    next()
  }
  else res.json(menupermissions);
}

async function findcount(req, res, next) {
  if (req.body.size){
    await menupermissionCtrl.findcount(req);
    res.header("access-control-expose-headers", "error, totalPages, totalCount");
    res.setHeader("error", req.header.error);
    res.setHeader("totalPages", req.header.totalPages);
    res.setHeader("totalCount", req.header.totalCount);
    next();
  }
  else next()
}
