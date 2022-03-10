const express = require('express');
const asyncHandler = require('express-async-handler');
const payrollsettingCtrl = require('../controllers/payrollsetting.controller');
const commonCtrl = require('../controllers/common.controller');
const router = express.Router();
module.exports = router;

router.route('/')
  .post(asyncHandler(insert))

router.route('/:Id')
  .put(asyncHandler(update))
  .patch(asyncHandler(patch))
  .delete(asyncHandler(remove))
  .get(asyncHandler(findbyId))

router.route('/filter')
  .post(asyncHandler(findcount), asyncHandler(filter), commonCtrl.exportcsv)

router.route('/search/')
  .post(asyncHandler(filter),  commonCtrl.deepobjectsearch_like);

async function findbyId(req, res) {
  let payrollsetting = await payrollsettingCtrl.findbyId(req.params.Id);
  res.json(payrollsetting);
}

async function insert(req, res) {
  let payrollsetting = await payrollsettingCtrl.insert(req);
  res.json(payrollsetting);
}

async function update(req, res) {
  let payrollsetting = await payrollsettingCtrl.update(req.params.Id, req);
  res.json(payrollsetting);
}


async function patch(req, res) {
  let payrollsetting = await payrollsettingCtrl.patch(req.params.Id, req);
  res.json(payrollsetting);
}

async function remove(req, res) {
  let payrollsetting = await payrollsettingCtrl.remove(req.params.Id, req);
  res.json(payrollsetting);
}

async function findcount(req, res, next) {
  if (req.body.size){
    await payrollsettingCtrl.findcount(req);
    res.header("access-control-expose-headers", "error, totalPages, totalCount");
    res.setHeader("error", req.header.error);
    res.setHeader("totalPages", req.header.totalPages);
    res.setHeader("totalCount", req.header.totalCount);
    next();
  }
  else next()
}

async function filter(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "payrollsetting";
  //console.log(req.body)
  let payrollsettings = await payrollsettingCtrl.filter(req.body);  
  if (req.body.export) {
    req.body.data = payrollsettings
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = payrollsettings
    next()
  }
  else res.json(payrollsettings);
}

