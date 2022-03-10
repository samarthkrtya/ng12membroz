const express = require('express');
const asyncHandler = require('express-async-handler');
const purchaseinvoiceCtrl = require('../controllers/purchaseinvoice.controller');
const commonCtrl = require('../controllers/common.controller');
const inventoryCtrl = require('../controllers/inventory.controller');

const router = express.Router();
module.exports = router;

router.route('/')
  .post(asyncHandler(purchaseinvoiceCtrl.getnextdocnumber), asyncHandler(insert), asyncHandler(updateinventory))

router.route('/:Id')
  .put(asyncHandler(update), asyncHandler(updateinventory))
  .delete(asyncHandler(remove))
  .get(asyncHandler(findbyId))

router.route('/filter')
  .post(asyncHandler(findcount), asyncHandler(filter), commonCtrl.exportcsv)

router.route('/search/')
  .post(asyncHandler(filter),  commonCtrl.deepobjectsearch_like);

router.route('/view/pinumber')
  .get(asyncHandler(purchaseinvoiceCtrl.getnextdocnumber))

router.route('/invoicedetail/')
  .post(asyncHandler(getinvoicedetail));

async function findbyId(req, res, next) {
  let purchaseinvoice = await purchaseinvoiceCtrl.findbyId(req.params.Id);
  res.json(purchaseinvoice);
}

async function updateinventory(req, res) {
  let bill = await inventoryCtrl.updateinventory(req.body);
  res.json(bill);
}

async function insert(req, res, next) {
  let purchaseinvoice = await purchaseinvoiceCtrl.insert(req);
  req.body.purchaseinvoice = purchaseinvoice;
  next();
}

async function update(req, res, next) {
  let purchaseinvoice = await purchaseinvoiceCtrl.update(req.params.Id, req);
  req.body.purchaseinvoice = purchaseinvoice;
  next()
}

async function remove(req, res) {
  let purchaseinvoice = await purchaseinvoiceCtrl.remove(req.params.Id, req);
  res.json(purchaseinvoice);
}

async function findcount(req, res, next) {
  if (req.body.size){
    await purchaseinvoiceCtrl.findcount(req);
    res.header("access-control-expose-headers", "error, totalPages, totalCount");
    res.setHeader("error", req.header.error);
    res.setHeader("totalPages", req.header.totalPages);
    res.setHeader("totalCount", req.header.totalCount);
    next();
  }
  else next()
}

async function filter(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "purchaseinvoice";
  let purchaseinvoices = await purchaseinvoiceCtrl.filter(req.body);
  if (req.body.export) {
    req.body.data = purchaseinvoices
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = purchaseinvoices
    next()
  }
  else res.json(purchaseinvoices);
}


async function getinvoicedetail(req, res, next) {
  let invoicedetail = await purchaseinvoiceCtrl.getinvoicedetail(req);
  invoicedetail = { taxamount: invoicedetail.taxamount, billamount: invoicedetail.billamount, grandtotal: invoicedetail.grandtotal, taxdetail: invoicedetail.taxdetail }
  res.json(invoicedetail);
}