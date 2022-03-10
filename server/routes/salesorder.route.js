const express = require('express');
const asyncHandler = require('express-async-handler');
const salesorderCtrl = require('../controllers/salesorder.controller');
const billCtrl = require('../controllers/bill.controller');
const commonCtrl = require('../controllers/common.controller');
const dashboardCtrl = require('../controllers/dashboard.controller');
const router = express.Router();
module.exports = router;

router.route('/')
  .post(asyncHandler(salesorderCtrl.getnextdocnumber), asyncHandler(insert))

router.route('/:Id')
  .put(asyncHandler(update))
  .delete(asyncHandler(remove))
  .get(asyncHandler(findbyId))

router.route('/filter')
  .post(asyncHandler(findcount), asyncHandler(filter), commonCtrl.exportcsv)

router.route('/search/')
  .post(asyncHandler(filter),  commonCtrl.deepobjectsearch_like);

router.route('/view/sonumber')
  .get(asyncHandler(salesorderCtrl.getnextdocnumber))

router.route('/converttobill/:Id')
  .get(asyncHandler(salesorderCtrl.converttobill), asyncHandler(billCtrl.getnextdocnumber), asyncHandler(insertbill))

async function findbyId(req, res) {
  let quotation = await salesorderCtrl.findbyId(req.params.Id);
  res.json(quotation);
}

async function insert(req, res) {
  let quotation = await salesorderCtrl.insert(req);
  res.json(quotation);
}

async function update(req, res) {
  let quotation = await salesorderCtrl.update(req.params.Id, req);
  res.json(quotation);
}

async function remove(req, res) {
  let quotation = await salesorderCtrl.remove(req.params.Id, req);
  res.json(quotation);
}

async function insertbill(req, res) {
  let bill = await billCtrl.insert(req);
  res.json(bill);
}

async function findcount(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "salesorder";
  if (req.body.webpartid) {
    let ids = await dashboardCtrl.webpartfilter(req);
    req.body.search = [{ "searchfield": "_id", "searchvalue": ids, "datatype": "ObjectId", "criteria": "in" }]
  }
  if (req.body.size){
    await salesorderCtrl.findcount(req);
    res.header("access-control-expose-headers", "error, totalPages, totalCount");
    res.setHeader("error", req.header.error);
    res.setHeader("totalPages", req.header.totalPages);
    res.setHeader("totalCount", req.header.totalCount);
    next();
  }
  else next()
}

async function filter(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "salesorder";
  if (req.body.webpartid) {
    let ids = await dashboardCtrl.webpartfilter(req);
    req.body.search = [{ "searchfield": "_id", "searchvalue": ids, "datatype": "ObjectId", "criteria": "in" }]
  }
  let salesorders = await salesorderCtrl.filter(req.body);
  if (req.body.export) {
    req.body.data = salesorders
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = salesorders
    next()
  }
  else res.json(salesorders);
}

