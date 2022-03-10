const express = require('express');
const asyncHandler = require('express-async-handler');
const paymentitemCtrl = require('../controllers/paymentitem.controller');
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

router.route('/search/')
  .post(asyncHandler(filter),  commonCtrl.deepobjectsearch_like);

async function findbyId(req, res) {
  let paymentitem = await paymentitemCtrl.findbyId(req.params.Id);
  res.json(paymentitem);
}

async function insert(req, res) {
  let paymentitem = await paymentitemCtrl.insert(req);
  res.json(paymentitem);
}

async function update(req, res) {
  let paymentitem = await paymentitemCtrl.update(req.params.Id, req);
  res.json(paymentitem);
}

async function remove(req, res) {
  let paymentitem = await paymentitemCtrl.remove(req.params.Id, req);
  res.json(paymentitem);
}

async function findcount(req, res, next) {
  if (req.body.size){
    await paymentitemCtrl.findcount(req);
    res.header("access-control-expose-headers", "error, totalPages, totalCount");
    res.setHeader("error", req.header.error);
    res.setHeader("totalPages", req.header.totalPages);
    res.setHeader("totalCount", req.header.totalCount);
    next();
  }
  else next()
}

async function filter(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "paymentitem";
  let paymentitems = await paymentitemCtrl.filter(req.body);
  if (req.body.export) {
    req.body.data = paymentitems
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = paymentitems
    next()
  }
  else res.json(paymentitems);
}
