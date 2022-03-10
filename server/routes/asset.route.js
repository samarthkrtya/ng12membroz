const express = require('express');
const asyncHandler = require('express-async-handler');
const assetCtrl = require('../controllers/asset.controller');
const commonCtrl = require('../controllers/common.controller');
const router = express.Router();
module.exports = router;

router.route('/')
  .post(asyncHandler(insert))
router.route('/:Id')
  .put(asyncHandler(update))
  .patch(asyncHandler(patch))
  .delete(asyncHandler(remove))
  .get(asyncHandler(findbyId))

router.route('/filter')
  .post(asyncHandler(findcount), asyncHandler(filter), commonCtrl.exportcsv)

router.route('/view/filter')
  .post(asyncHandler(filterview))


router.route('/filter/vehicle/view')
  .post(asyncHandler(vehiclefilterview))

router.route('/search/')
  .post(asyncHandler(filter),  commonCtrl.deepobjectsearch_like);

async function findbyId(req, res) {
  let asset = await assetCtrl.findbyId(req.params.Id);
  res.json(asset);
}

async function patch(req, res) {
  let asset = await assetCtrl.patch(req.params.Id, req);
  res.json(asset);
}

async function insert(req, res) {
  let asset = await assetCtrl.insert(req);
  res.json(asset);
}

async function update(req, res) {
  let asset = await assetCtrl.update(req.params.Id, req);
  res.json(asset);
}

async function remove(req, res) {
  let asset = await assetCtrl.remove(req.params.Id, req);
  res.json(asset);
}

async function findcount(req, res, next) {
  if (req.body.size){
    await assetCtrl.findcount(req);
    res.header("access-control-expose-headers", "error, totalPages, totalCount");
    res.setHeader("error", req.header.error);
    res.setHeader("totalPages", req.header.totalPages);
    res.setHeader("totalCount", req.header.totalCount);
    next();
  }
  else next()
}

async function vehiclefilterview(req, res, next) {
  let vehicles = await assetCtrl.vehiclefilterview(req.body);
  res.json(vehicles);
}

async function filter(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "asset";
  let assets = await assetCtrl.filter(req.body);
  if (req.body.export) {
    req.body.data = assets
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = assets
    next()
  }
  else res.json(assets);
}

async function filterview(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "asset";
  let assets = await assetCtrl.filterview(req.body);
  res.json(assets);
}

