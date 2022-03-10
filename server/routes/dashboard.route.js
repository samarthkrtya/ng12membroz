const express = require('express');
const asyncHandler = require('express-async-handler');
const dashboardCtrl = require('../controllers/dashboard.controller');
const commonCtrl = require('../controllers/common.controller');
const router = express.Router();
module.exports = router;

router.route('/')
  .post(asyncHandler(insert))

router.route('/:Id')
  .put(asyncHandler(update))
  .post(asyncHandler(findbyId), dashboardCtrl.getwebparts)
  .patch(asyncHandler(patch))
  .get(asyncHandler(findbyId))
  .delete(asyncHandler(remove))

router.route('/webpart/filter')
  .post(dashboardCtrl.getwebpartdata)


router.route('/filter/view')
  .post(asyncHandler(findcount), asyncHandler(filter), commonCtrl.exportcsv)

async function insert(req, res) {
  let dashboard = await dashboardCtrl.insert(req);
  res.json(dashboard);
}

async function remove(req, res) {
  let dashboard = await dashboardCtrl.remove(req.params.Id, req);
  res.json(dashboard);
}

async function update(req, res) {
  let dashboard = await dashboardCtrl.update(req.params.Id, req);
  res.json(dashboard);
}

async function patch(req, res) {
  let dashboard = await dashboardCtrl.patch(req.params.Id, req);
  res.json(dashboard);
}

async function findbyId(req, res, next) {
  let dashboard = await dashboardCtrl.findbyId(req.params.Id, req);
  req.body.data = dashboard;
  if (req.body.matches) next();
  else res.json(dashboard);
}

async function filter(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "dashboard";
  let dashboards = await dashboardCtrl.filter(req.body);
  //console.log("dashboards", dashboards)
  if (req.body.export) {
    req.body.data = dashboards
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = dashboards
    next()
  }
  else res.json(dashboards);
}

async function findcount(req, res, next) {
  if (req.body.size){
    await dashboardCtrl.findcount(req);
    res.header("access-control-expose-headers", "error, totalPages, totalCount");
    res.setHeader("error", req.header.error);
    res.setHeader("totalPages", req.header.totalPages);
    res.setHeader("totalCount", req.header.totalCount);
    next();
  }
  else next()
}
