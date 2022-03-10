const express = require('express');
const asyncHandler = require('express-async-handler');
const purchaseorderCtrl = require('../controllers/purchaseorder.controller');
const purchaseinvoiceCtrl = require('../controllers/purchaseinvoice.controller');
const commonCtrl = require('../controllers/common.controller');
const templateCtrl = require('../controllers/template.controller');

const router = express.Router();
module.exports = router;

router.route('/')
  .post(asyncHandler(purchaseorderCtrl.getnextdocnumber), asyncHandler(insert))

router.route('/:Id')
  .put(asyncHandler(update))
  .delete(asyncHandler(remove))
  .get(asyncHandler(findbyId))

router.route('/filter')
  .post(asyncHandler(findcount), asyncHandler(filter), commonCtrl.exportcsv)

router.route('/search/')
  .post(asyncHandler(filter),  commonCtrl.deepobjectsearch_like);

router.route('/view/ponumber')
  .get(asyncHandler(purchaseorderCtrl.getnextdocnumber))

router.route('/converttopurchaseinvoice/:Id')
  .get(asyncHandler(purchaseorderCtrl.converttopurchaseinvoice), asyncHandler(purchaseinvoiceCtrl.getnextdocnumber), asyncHandler(purchaseinvoiceinsert))

async function findbyId(req, res, next) {
  let purchaseorder = await purchaseorderCtrl.findbyId(req.params.Id);
  res.json(purchaseorder);
}

async function insert(req, res) {
  let purchaseorder = await purchaseorderCtrl.insert(req);
  res.json(purchaseorder);
}

async function purchaseinvoiceinsert(req, res) {
  let purchaseinvoice = await purchaseinvoiceCtrl.insert(req);
  res.json(purchaseinvoice);
}

async function update(req, res) {
  let purchaseorder = await purchaseorderCtrl.update(req.params.Id, req);
  res.json(purchaseorder);
}

async function remove(req, res) {
  let purchaseorder = await purchaseorderCtrl.remove(req.params.Id, req);
  res.json(purchaseorder);
}

async function findcount(req, res, next) {
  if (req.body.size){
    await purchaseorderCtrl.findcount(req);
    res.header("access-control-expose-headers", "error, totalPages, totalCount");
    res.setHeader("error", req.header.error);
    res.setHeader("totalPages", req.header.totalPages);
    res.setHeader("totalCount", req.header.totalCount);
    next();
  }
  else next()
}

async function filter(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "purchaseorder";
  let purchaseorders = await purchaseorderCtrl.filter(req.body);
  if (req.body.export) {
    req.body.data = purchaseorders
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = purchaseorders
    next()
  }
  else res.json(purchaseorders);
}
