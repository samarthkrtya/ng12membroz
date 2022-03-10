const express = require('express');
const asyncHandler = require('express-async-handler');
const purchaserequestCtrl = require('../controllers/purchaserequest.controller');
const purchaseorderCtrl = require('../controllers/purchaseorder.controller');
const commonCtrl = require('../controllers/common.controller');
const templateCtrl = require('../controllers/template.controller');

const router = express.Router();
module.exports = router;

router.route('/')
  .post(asyncHandler(purchaserequestCtrl.getnextdocnumber), asyncHandler(insert))

router.route('/:Id')
  .put(asyncHandler(update))
  .delete(asyncHandler(remove))
  .get(asyncHandler(findbyId))

router.route('/filter')
  .post(asyncHandler(findcount), asyncHandler(filter), commonCtrl.exportcsv)

router.route('/search/')
  .post(asyncHandler(filter),  commonCtrl.deepobjectsearch_like);

router.route('/view/prnumber')
  .get(asyncHandler(purchaserequestCtrl.getnextdocnumber))

async function findbyId(req, res, next) {
  let purchaserequest = await purchaserequestCtrl.findbyId(req.params.Id);
  res.json(purchaserequest);
}

async function insert(req, res) {
  let purchaserequest = await purchaserequestCtrl.insert(req);
  res.json(purchaserequest);
}

async function update(req, res) {
  let purchaserequest = await purchaserequestCtrl.update(req.params.Id, req);
  res.json(purchaserequest);
}

async function remove(req, res) {
  let purchaserequest = await purchaserequestCtrl.remove(req.params.Id, req);
  res.json(purchaserequest);
}

async function findcount(req, res, next) {
  if (req.body.size){
    await purchaserequestCtrl.findcount(req);
    res.header("access-control-expose-headers", "error, totalPages, totalCount");
    res.setHeader("error", req.header.error);
    res.setHeader("totalPages", req.header.totalPages);
    res.setHeader("totalCount", req.header.totalCount);
    next();
  }
  else next()
}

async function filter(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "purchaserequest";
  let purchaserequests = await purchaserequestCtrl.filter(req.body);
  if (req.body.export) {
    req.body.data = purchaserequests
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = purchaserequests
    next()
  }
  else res.json(purchaserequests);
}
