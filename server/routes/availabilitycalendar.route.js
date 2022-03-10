const express = require('express');
const asyncHandler = require('express-async-handler');
const availabilitycalendarCtrl = require('../controllers/availabilitycalendar.controller');
const analyticsreportCtrl = require('../controllers/analyticsreport.controller');
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

router.route('/massupdate')
  .post(asyncHandler(massupdate))

router.route('/usermassupdate')
  .post(asyncHandler(usermassupdate))
  

router.route('/search/')
  .post(asyncHandler(filter),  commonCtrl.deepobjectsearch_like);

async function findbyId(req, res) {
  let availabilitycalendar = await availabilitycalendarCtrl.findbyId(req.params.Id);
  res.json(availabilitycalendar);
}

async function insert(req, res) {
  let availabilitycalendar = await availabilitycalendarCtrl.insert(req);
  res.json(availabilitycalendar);
}

async function update(req, res) {
  let availabilitycalendar = await availabilitycalendarCtrl.update(req.params.Id, req);
  res.json(availabilitycalendar);
}

async function remove(req, res) {
  let availabilitycalendar = await availabilitycalendarCtrl.remove(req.params.Id, req);
  res.json(availabilitycalendar);
}

async function findcount(req, res, next) {
  if (req.body.size){
    await availabilitycalendarCtrl.findcount(req);
    res.header("access-control-expose-headers", "error, totalPages, totalCount");
    res.setHeader("error", req.header.error);
    res.setHeader("totalPages", req.header.totalPages);
    res.setHeader("totalCount", req.header.totalCount);
    next();
  }
  else next()
}

async function filter(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "availabilitycalendar";
  let availabilitycalendars = await availabilitycalendarCtrl.filter(req.body);
  if (req.body.export) {
    req.body.data  = availabilitycalendars;
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data  = availabilitycalendars;
    next()
  }
  else res.json(availabilitycalendars);
}

async function massupdate(req, res) {
  
  req.body.formname = req.body.formname ? req.body.formname: "availabilitycalendar";
  let availabilitycalendars = await availabilitycalendarCtrl.massupdate(req);
  res.json(availabilitycalendars);
}

async function usermassupdate(req, res) {
  
  req.body.formname = req.body.formname ? req.body.formname: "availabilitycalendar";
  let availabilitycalendars = await availabilitycalendarCtrl.usermassupdate(req);
  res.json(availabilitycalendars);
}



