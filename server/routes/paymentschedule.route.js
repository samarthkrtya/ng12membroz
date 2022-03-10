const express = require('express');
const asyncHandler = require('express-async-handler');
const paymentscheduleCtrl = require('../controllers/paymentschedule.controller');
const dashboardCtrl = require('../controllers/dashboard.controller');
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

router.route('/updateschedules/:Id')
  .put(asyncHandler(paymentscheduleCtrl.getnextdocnumber), asyncHandler(updateschedules))

router.route('/view/filter')
  .post(asyncHandler(filterview))

router.route('/search/')
  .post(asyncHandler(filter),  commonCtrl.deepobjectsearch_like);

async function findbyId(req, res) {
  let paymentschedule = await paymentscheduleCtrl.findbyId(req.params.Id);
  res.json(paymentschedule);
}


async function updateschedules(req, res) {
  let paymentschedule = await paymentscheduleCtrl.updateschedules(req.params.Id, req);
  res.json(paymentschedule);
}

async function insert(req, res) {
  let paymentschedule = await paymentscheduleCtrl.insert(req);
  res.json(paymentschedule);
}

async function update(req, res) {
  let paymentschedule = await paymentscheduleCtrl.update(req.params.Id, req);
  res.json(paymentschedule);
}

async function remove(req, res) {
  let paymentschedule = await paymentscheduleCtrl.remove(req.params.Id, req);
  res.json(paymentschedule);
}

async function findcount(req, res, next) {
  if (req.body.size){
    if (req.body.webpartid) {
      let ids = await dashboardCtrl.webpartfilter(req);
      req.body.search = [{ "searchfield": "_id", "searchvalue": ids, "datatype": "ObjectId", "criteria": "in" }]
    }
    await paymentscheduleCtrl.findcount(req);
    res.header("access-control-expose-headers", "error, totalPages, totalCount");
    res.setHeader("error", req.header.error);
    res.setHeader("totalPages", req.header.totalPages);
    res.setHeader("totalCount", req.header.totalCount);
    next();
  }
  else next()
}

async function filterview(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "paymentschedule";
  let paymentschedules = await paymentscheduleCtrl.filterview(req.body);
  res.json(paymentschedules);
}

async function filter(req, res, next) {
  if (req.body.webpartid) {
    let ids = await dashboardCtrl.webpartfilter(req);
    req.body.search = [{ "searchfield": "_id", "searchvalue": ids, "datatype": "ObjectId", "criteria": "in" }]
  }
  req.body.formname = req.body.formname? req.body.formname: "paymentschedule";
  let paymentschedules = await paymentscheduleCtrl.filter(req.body);
  if (req.body.export) {
    req.body.data = paymentschedules
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = paymentschedules
    next()
  }
  else res.json(paymentschedules);
}
