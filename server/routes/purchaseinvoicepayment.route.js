const express = require('express');
const asyncHandler = require('express-async-handler');
const purchaseinvoicepaymentCtrl = require('../controllers/purchaseinvoicepayment.controller');
const purchaseinvoiceCtrl = require('../controllers/purchaseinvoice.controller');

const commonCtrl = require('../controllers/common.controller');
const templateCtrl = require('../controllers/template.controller');

const router = express.Router();
module.exports = router;

router.route('/')
  .post(asyncHandler(purchaseinvoicepaymentCtrl.getnextdocnumber), asyncHandler(finditembyId), asyncHandler(insert), asyncHandler(insertmultiple))

router.route('/:Id')
  .put(asyncHandler(update))
  .delete(asyncHandler(remove))
  .get(asyncHandler(findbyId))

router.route('/filter')
  .post(asyncHandler(findcount), asyncHandler(filter), commonCtrl.exportcsv)

router.route('/search/')
  .post(asyncHandler(filter),  commonCtrl.deepobjectsearch_like);

router.route('/view/ipnumber')
  .get(asyncHandler(purchaseinvoicepaymentCtrl.getnextdocnumber))

async function findbyId(req, res, next) {
  let purchaseinvoicepayment = await purchaseinvoicepaymentCtrl.findbyId(req.params.Id);
  res.json(purchaseinvoicepayment);
}

async function finditembyId(req, res, next) {
  var items = req.body.items;
  let paymentschedules = await purchaseinvoiceCtrl.findbyIds(items.map(a=>a._id));
  req.body.items = paymentschedules;
  next();
}

async function insert(req, res , next) {
  if (req.body.items) next();
  else {
    let purchaseinvoicepayment = await purchaseinvoicepaymentCtrl.insert(req);
    res.json(purchaseinvoicepayment);
  }
}

async function insertmultiple(req, res) {
  let payments = await purchaseinvoicepaymentCtrl.insertmultiple(req);
  res.json(payments);
}

async function update(req, res) {
  let purchaseinvoicepayment = await purchaseinvoicepaymentCtrl.update(req.params.Id, req);
  res.json(purchaseinvoicepayment);
}

async function remove(req, res) {
  let purchaseinvoicepayment = await purchaseinvoicepaymentCtrl.remove(req.params.Id, req);
  res.json(purchaseinvoicepayment);
}

async function updateinventory(req, res) {
  let inventory = await inventoryCtrl.findybyItemid(req.body.billitem._id);
  if (!inventory){
    req.body.itemid = req.body.billitem._id;
    await inventoryCtrl.insert(req);
  }
  res.json(req.body.billitem);
}

async function findcount(req, res, next) {
  if (req.body.size){
    await purchaseinvoicepaymentCtrl.findcount(req);
    res.header("access-control-expose-headers", "error, totalPages, totalCount");
    res.setHeader("error", req.header.error);
    res.setHeader("totalPages", req.header.totalPages);
    res.setHeader("totalCount", req.header.totalCount);
    next();
  }
  else next()
}

async function filter(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "purchaseinvoicepayment";
  let purchaseinvoicepayments = await purchaseinvoicepaymentCtrl.filter(req.body);
  if (req.body.export) {
    req.body.data = purchaseinvoicepayments
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = purchaseinvoicepayments
    next()
  }
  else res.json(purchaseinvoicepayments);
}
