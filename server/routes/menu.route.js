const express = require('express');
const asyncHandler = require('express-async-handler');
const menuCtrl = require('../controllers/menu.controller');
const commonCtrl = require('../controllers/common.controller');
const router = express.Router();
module.exports = router;

router.route('/')
  .post(asyncHandler(insert))

router.route('/:Id')
  .put(asyncHandler(update))
  .get(asyncHandler(findbyId))

router.route('/filter')
.post(asyncHandler(findcount), asyncHandler(filter), commonCtrl.exportcsv)

router.route('/usermenu/filter')
  .post(asyncHandler(filterUsermenu))

async function findbyId(req, res) {
  let menu = await menuCtrl.findbyId(req.params.Id);
  res.json(menu);
}

async function insert(req, res) {
  let menu = await menuCtrl.insert(req);
  res.json(menu);
}

async function update(req, res) {
  let menu = await menuCtrl.update(req.params.Id, req);
  res.json(menu);
}

async function filter(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "menu";
  let menus = await menuCtrl.filter(req.body);
  if (req.body.export) {
    req.body.data = menus
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = menus
    next()
  }
  else res.json(menus);
}

async function filterUsermenu(req, res) {
  let menus = await menuCtrl.filterUsermenu(req.body);
  res.json(menus);
}

async function findcount(req, res, next) {
  if (req.body.size){
    await menuCtrl.findcount(req);
    res.header("access-control-expose-headers", "error, totalPages, totalCount");
    res.setHeader("error", req.header.error);
    res.setHeader("totalPages", req.header.totalPages);
    res.setHeader("totalCount", req.header.totalCount);
    next();
  }
  else next()
}
