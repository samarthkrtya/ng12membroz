const express = require('express');
const asyncHandler = require('express-async-handler');
const wallettxnCtrl = require('../controllers/wallettxn.controller');
const commonCtrl = require('../controllers/common.controller');
const dashboardCtrl = require('../controllers/dashboard.controller');
const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))

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
  .post(asyncHandler(findcount), asyncHandler(viewfilter), commonCtrl.exportcsv)

router.route('/search/')
  .post(asyncHandler(filter), commonCtrl.deepobjectsearch_like);

async function findbyId(req, res) {
  let wallettxn = await wallettxnCtrl.findbyId(req.params.Id);
  res.json(wallettxn);
}

async function insert(req, res) {
  let wallettxn = await wallettxnCtrl.insert(req);
  res.json(wallettxn);
}

async function update(req, res) {
  let wallettxn = await wallettxnCtrl.update(req.params.Id, req);
  res.json(wallettxn);
}

async function patch(req, res) {
  let wallettxn = await wallettxnCtrl.patch(req.params.Id, req);
  res.json(wallettxn);
}

async function remove(req, res) {
  let wallettxn = await wallettxnCtrl.remove(req.params.Id, req);
  res.json(wallettxn);
}

async function findcount(req, res, next) {
  req.body.formname = req.body.formname ? req.body.formname : "wallettxn";
  if (req.body.size) {
    if (req.body.webpartid) {
      let ids = await dashboardCtrl.webpartfilter(req);
      req.body.search = [{ "searchfield": "_id", "searchvalue": ids, "datatype": "ObjectId", "criteria": "in" }]
    }
    await wallettxnCtrl.findcount(req);
    res.header("access-control-expose-headers", "error, totalPages, totalCount");
    res.setHeader("error", req.header.error);
    res.setHeader("totalPages", req.header.totalPages);
    res.setHeader("totalCount", req.header.totalCount);
    next();
  }
  else next()
}

async function filter(req, res, next) {
  req.body.formname = req.body.formname ? req.body.formname : "wallettxn";
  if (req.body.webpartid) {
    let ids = await dashboardCtrl.webpartfilter(req);
    req.body.search = [{ "searchfield": "_id", "searchvalue": ids, "datatype": "ObjectId", "criteria": "in" }]
  }
  let wallettxn = await wallettxnCtrl.filter(req.body);
  if (req.body.export) {
    req.body.data = wallettxn
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)) {
    req.body.data = wallettxn
    next()
  }
  else res.json(wallettxn);
}

async function viewfilter(req, res, next) {
  
  req.body.formname = req.body.formname ? req.body.formname : "wallettxn";
  var viewname = req.body.viewname;
  let wallettxns;
  if (viewname) {
    wallettxns = await commonCtrl.viewfilter(req, res);
  }
  else {
    wallettxns = await wallettxnCtrl.viewfilter(req.body);
  }
  if (req.body.export) {
    req.body.data = wallettxns
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)) {
    req.body.data = wallettxns
    next()
  }
  else res.json(wallettxns);
}

