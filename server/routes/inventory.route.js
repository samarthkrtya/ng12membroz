const express = require('express');
const asyncHandler = require('express-async-handler');
const inventoryCtrl = require('../controllers/inventory.controller');
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

router.route('/search/')
  .post(asyncHandler(filter),  commonCtrl.deepobjectsearch_like);

router.route('/triggerstock/')
  .post(asyncHandler(updatetriggerqty));

async function findbyId(req, res) {
  let inventory = await inventoryCtrl.findbyId(req.params.Id);
  res.json(inventory);
}

async function insert(req, res) {
  let inventory = await inventoryCtrl.insert(req);
  res.json(inventory);
}

async function update(req, res) {
  let inventory = await inventoryCtrl.update(req.params.Id, req);
  res.json(inventory);
}

async function patch(req, res) {
  let inventory = await inventoryCtrl.patch(req.params.Id, req);
  res.json(inventory);
}

async function updatetriggerqty(req, res) {
  let inventories = await inventoryCtrl.updatetriggerqty(req);
  res.json(inventories);
}

async function remove(req, res) {
  let inventory = await inventoryCtrl.remove(req.params.Id, req);
  res.json(inventory);
}

async function findcount(req, res, next) {
  if (req.body.size){
    await inventoryCtrl.findcount(req);
    res.header("access-control-expose-headers", "error, totalPages, totalCount");
    res.setHeader("error", req.header.error);
    res.setHeader("totalPages", req.header.totalPages);
    res.setHeader("totalCount", req.header.totalCount);
    next();
  }
  else next()
}

async function filter(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "inventory";
  let inventories = await inventoryCtrl.filter(req.body);
  if (req.body.export) {
    req.body.data = inventories;
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = inventories;
    next()
  }
  else res.json(inventories);
}

