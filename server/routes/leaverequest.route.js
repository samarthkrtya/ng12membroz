const express = require('express');
const asyncHandler = require('express-async-handler');
const leaverequestCtrl = require('../controllers/leaverequest.controller');
const commonCtrl = require('../controllers/common.controller');
const formdataCtrl = require('../controllers/formdata.controller');
const router = express.Router();
module.exports = router;

router.route('/')
  .post(asyncHandler(validatedata), asyncHandler(convertdatatype), asyncHandler(insert))

router.route('/:Id')
  .put(asyncHandler(validatedata), asyncHandler(convertdatatype), asyncHandler(update))
  .delete(asyncHandler(remove))
  .get(asyncHandler(findbyId))

router.route('/filter')
  .post(asyncHandler(findcount), asyncHandler(filter), commonCtrl.exportcsv)

router.route('/search/')
  .post(asyncHandler(filter),  commonCtrl.deepobjectsearch_like);

async function findbyId(req, res) {
  let leaverequest = await leaverequestCtrl.findbyId(req.params.Id);
  res.json(leaverequest);
}

async function insert(req, res) {
  let leaverequest = await leaverequestCtrl.insert(req);
  res.json(leaverequest);
}

async function update(req, res) {
  let leaverequest = await leaverequestCtrl.update(req.params.Id, req);
  res.json(leaverequest);
}

async function remove(req, res) {
  let leaverequest = await leaverequestCtrl.remove(req.params.Id, req);
  res.json(leaverequest);
}

async function validatedata(req, res, next) {
  req.body.formid = "604b6c4099e17f0f40d848eb";
  await formdataCtrl.validatedata(req, res, next);
}

async function convertdatatype(req, res, next) {
  req.body.formid = "604b6c4099e17f0f40d848eb";
  await formdataCtrl.convertdatatype(req, res, next);
}

async function findcount(req, res, next) {
  if (req.body.size){
    await leaverequestCtrl.findcount(req);
    res.header("access-control-expose-headers", "error, totalPages, totalCount");
    res.setHeader("error", req.header.error);
    res.setHeader("totalPages", req.header.totalPages);
    res.setHeader("totalCount", req.header.totalCount);
    next();
  }
  else next()
}

async function filter(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "leaverequest";
  let leaverequests = await leaverequestCtrl.filter(req.body);
  if (req.body.export) {
    req.body.data = leaverequests;
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = leaverequests;
    next()
  }
  else res.json(leaverequests);
}

