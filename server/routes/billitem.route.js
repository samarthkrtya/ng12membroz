const express = require('express');
const asyncHandler = require('express-async-handler');
const billitemCtrl = require('../controllers/billitem.controller');
const inventoryCtrl = require('../controllers/inventory.controller');
const commonCtrl = require('../controllers/common.controller');
const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))

router.route('/')
  .post(asyncHandler(insert), asyncHandler(updateinventory))

router.route('/:Id')
  .put(asyncHandler(update), asyncHandler(updateinventory))
  .patch(asyncHandler(patch))
  .delete(asyncHandler(remove))
  .get(asyncHandler(findbyId))

router.route('/filter')
  .post(asyncHandler(findcount), asyncHandler(filter), commonCtrl.exportcsv)

router.route('/filter/view')
  .post(asyncHandler(filterview))

router.route('/view/filter')
  .post(asyncHandler(findcount), asyncHandler(viewfilter), commonCtrl.exportcsv)

router.route('/search/')
  .post(asyncHandler(filter),  commonCtrl.deepobjectsearch_like);

async function findbyId(req, res) {
  let billitem = await billitemCtrl.findbyId(req.params.Id);
  res.json(billitem);
}

async function insert(req, res, next) {
  let billitem = await billitemCtrl.insert(req);
  ////console.log(billitem)
  if (billitem.enableinventory){
    req.body.billitem = billitem
    next();
  }
  else {
    res.json(billitem);
  }
}

async function updateinventory(req, res) {
  let inventory = await inventoryCtrl.findybyItemid(req.body.billitem._id);
  if (!inventory){
    //console.log(inventory)
    req.body.itemid = req.body.billitem._id;
    await inventoryCtrl.insert(req);
  }
  res.json(req.body.billitem);
}

async function update(req, res, next) {
  let billitem = await billitemCtrl.update(req.params.Id, req);
  if (billitem.enableinventory){
    req.body.billitem = billitem
    next();
  }
  else {
    res.json(billitem);
  }
}

async function remove(req, res) {
  let billitem = await billitemCtrl.remove(req.params.Id, req);
  res.json(billitem);
}

async function patch(req, res) {
  let billitem = await billitemCtrl.patch(req.params.Id, req);
  res.json(billitem);
}



async function findcount(req, res, next) {
  if (req.body.size){
    await billitemCtrl.findcount(req);
    res.header("access-control-expose-headers", "error, totalPages, totalCount");
    res.setHeader("error", req.header.error);
    res.setHeader("totalPages", req.header.totalPages);
    res.setHeader("totalCount", req.header.totalCount);
    next();
  }
  else next()
}

async function filter(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "product";
  let billitems = await billitemCtrl.filter(req.body);

  if (req.body.export) {
    req.body.data = billitems
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = billitems
    next()
  }
  else res.json(billitems);
}

async function filterview(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "product";
  let billitems = await billitemCtrl.filterview(req.body);
  res.json(billitems);
}

async function viewfilter(req, res, next) {

  req.body.formname = req.body.formname? req.body.formname: "product";
  var viewname = req.body.viewname;
  let billitems;
  if (viewname) {
    billitems = await commonCtrl.viewfilter(req, res);
  }
  else {
    billitems = await billitemCtrl.viewfilter(req.body);
  }
  if (req.body.export) {
    req.body.data = billitems
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = billitems
    next()
  }
  else res.json(billitems);
}