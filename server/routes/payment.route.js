const express = require('express');
const asyncHandler = require('express-async-handler');
const paymentCtrl = require('../controllers/payment.controller');
const paymentscheduleCtrl = require('../controllers/paymentschedule.controller');
const commonCtrl = require('../controllers/common.controller');
const dashboardCtrl = require('../controllers/dashboard.controller');
const router = express.Router();
module.exports = router;

router.route('/')
  .post(asyncHandler(paymentCtrl.getnextdocnumber), asyncHandler(finditembyId), asyncHandler(insert), asyncHandler(insertmultiple), asyncHandler(multiplepayment))

router.route('/:Id')
  .put(asyncHandler(update))
  .delete(asyncHandler(remove))
  .get(asyncHandler(findbyId))

router.route('/filter')
  .post(asyncHandler(findcount), asyncHandler(filter), commonCtrl.exportcsv)

router.route('/search/')
  .post(asyncHandler(filter),  commonCtrl.deepobjectsearch_like);

router.route('/view/receiptnumber')
  .get(asyncHandler(paymentCtrl.getnextdocnumber))

async function findbyId(req, res) {
  let payment = await paymentCtrl.findbyId(req.params.Id);
  res.json(payment);
}

async function finditembyId(req, res, next) {
  var itemid = req.body.item;
  var itemsid = req.body.items;
  if (!itemsid) {
    let paymentschedule = await paymentscheduleCtrl.findbyId(itemid);
    req.body.item = paymentschedule;
  }
  else {
    let paymentschedules = await paymentscheduleCtrl.findbyIds(itemsid);
    req.body.items = paymentschedules;
  }
  next();
}

async function insert(req, res, next) {
  if (req.body.items) next();
  else {
    let payment = await paymentCtrl.insert(req);
    res.json(payment);
  }
}

async function insertmultiple(req, res, next) {
  if (req.body.multiple) next();
  else {
    let payments = await paymentCtrl.insertmultiple(req);
    res.json(payments);
  }
}

async function multiplepayment(req, res) {
  let payments = await paymentCtrl.multiplepayment(req);
  res.json(payments);
}

async function update(req, res) {
  let payment = await paymentCtrl.update(req.params.Id, req);
  res.json(payment);
}

async function remove(req, res) {
  let payment = await paymentCtrl.remove(req.params.Id, req);
  res.json(payment);
}

async function findcount(req, res, next) {
  if (req.body.size){
    if (req.body.webpartid) {
      let ids = await dashboardCtrl.webpartfilter(req);
      req.body.search = [{ "searchfield": "_id", "searchvalue": ids, "datatype": "ObjectId", "criteria": "in" }]
    }
    await paymentCtrl.findcount(req);
    res.header("access-control-expose-headers", "error, totalPages, totalCount");
    res.setHeader("error", req.header.error);
    res.setHeader("totalPages", req.header.totalPages);
    res.setHeader("totalCount", req.header.totalCount);
    next();
  }
  else next()
}

async function filter(req, res, next) {
  if (req.body.webpartid) {
    let ids = await dashboardCtrl.webpartfilter(req);
    req.body.search = [{ "searchfield": "_id", "searchvalue": ids, "datatype": "ObjectId", "criteria": "in" }]
  }
  req.body.formname = req.body.formname? req.body.formname: "payment";
  let payments = await paymentCtrl.filter(req.body);
  if (req.body.export) {
    req.body.data = payments
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = payments
    next()
  }
  else res.json(payments);
}
