const express = require('express');
const asyncHandler = require('express-async-handler');
const tax = require('../controllers/tax.controller');
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
  let saleschannelteam = await tax.findbyId(req.params.Id);
  res.json(saleschannelteam);
}

async function insert(req, res) {
  let saleschannelteam = await tax.insert(req);
  res.json(saleschannelteam);
}

async function update(req, res) {
  let saleschannelteam = await tax.update(req.params.Id, req);
  res.json(saleschannelteam);
}

async function remove(req, res) {
  let saleschannelteam = await tax.remove(req.params.Id, req);
  res.json(saleschannelteam);
}

async function findcount(req, res, next) {
  if (req.body.size){
    await tax.findcount(req);
    res.header("access-control-expose-headers", "error, totalPages, totalCount");
    res.setHeader("error", req.header.error);
    res.setHeader("totalPages", req.header.totalPages);
    res.setHeader("totalCount", req.header.totalCount);
    next();
  }
  else next()
}

async function filter(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "tax";
  let taxes = await tax.filter(req.body);
  if (req.body.export) {
    req.body.data = taxes
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = taxes
    next()
  }
  else res.json(taxes);
}

