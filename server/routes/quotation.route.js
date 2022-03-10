const express = require('express');
const asyncHandler = require('express-async-handler');
const quotationCtrl = require('../controllers/quotation.controller');
const billCtrl = require('../controllers/bill.controller');
const commonCtrl = require('../controllers/common.controller');
const router = express.Router();
module.exports = router;

router.route('/')
  .post(asyncHandler(quotationCtrl.getnextdocnumber), asyncHandler(insert))

router.route('/:Id')
  .put(asyncHandler(update))
  .delete(asyncHandler(remove))
  .patch(asyncHandler(patch))
  .get(asyncHandler(findbyId))

router.route('/filter')
  .post(asyncHandler(findcount), asyncHandler(filter), commonCtrl.exportcsv)

router.route('/search/')
  .post(asyncHandler(filter),  commonCtrl.deepobjectsearch_like);

router.route('/view/qnnumber')
  .get(asyncHandler(quotationCtrl.getnextdocnumber))

router.route('/view/filter')
  .post(asyncHandler(findcount), asyncHandler(viewfilter), commonCtrl.exportcsv)

router.route('/converttobill/:Id')
  .get(asyncHandler(quotationCtrl.converttobill), asyncHandler(billCtrl.getnextdocnumber), asyncHandler(insertbill))
  

async function findbyId(req, res) {
  let quotation = await quotationCtrl.findbyId(req.params.Id);
  res.json(quotation);
}

async function insert(req, res) {
  let quotation = await quotationCtrl.insert(req);
  res.json(quotation);
}

async function insertbill(req, res) {
  let bill = await billCtrl.insert(req);
  res.json(bill);
}

async function update(req, res) {
  let quotation = await quotationCtrl.update(req.params.Id, req);
  res.json(quotation);
}

async function patch(req, res) {
  let quotation = await quotationCtrl.patch(req.params.Id, req);
  res.json(quotation);
}

async function remove(req, res) {
  let quotation = await quotationCtrl.remove(req.params.Id, req);
  res.json(quotation);
}

async function findcount(req, res, next) {
  if (req.body.size){
    await quotationCtrl.findcount(req);
    res.header("access-control-expose-headers", "error, totalPages, totalCount");
    res.setHeader("error", req.header.error);
    res.setHeader("totalPages", req.header.totalPages);
    res.setHeader("totalCount", req.header.totalCount);
    next();
  }
  else next()
}

async function filter(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "quotation";
  let quotations = await quotationCtrl.filter(req.body);
  if (req.body.export) {
    req.body.data = quotations
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = quotations
    next()
  }
  else res.json(quotations);
}

async function viewfilter(req, res, next) {

  req.body.formname = req.body.formname? req.body.formname: "quotation";
  var viewname = req.body.viewname;
  let quotations;
  if (viewname) {
    quotations = await commonCtrl.viewfilter(req, res);
  }
  else {
    quotations = await quotationCtrl.viewfilter(req.body);
  }
  if (req.body.export) {
    req.body.data = quotations
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = quotations
    next()
  }
  else res.json(quotations);
}