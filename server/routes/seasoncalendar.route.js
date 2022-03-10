const express = require('express');
const asyncHandler = require('express-async-handler');
const seasoncalendarCtrl = require('../controllers/seasoncalendar.controller');
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

router.route('/seasonweeks/:year')
  .get(seasoncalendarCtrl.getseasonweeks)
  .put(seasoncalendarCtrl.clearseasonweeks)


async function findbyId(req, res) {
  let seasoncalendar = await seasoncalendarCtrl.findbyId(req.params.Id);
  res.json(seasoncalendar);
}

async function insert(req, res) {
  let seasoncalendar = await seasoncalendarCtrl.insert(req);
  res.json(seasoncalendar);
}

async function update(req, res) {
  let seasoncalendar = await seasoncalendarCtrl.update(req.params.Id, req);
  res.json(seasoncalendar);
}

async function remove(req, res) {
  let seasoncalendar = await seasoncalendarCtrl.remove(req.params.Id, req);
  res.json(seasoncalendar);
}


async function findcount(req, res, next) {
  if (req.body.size){
    await seasoncalendarCtrl.findcount(req);
    res.header("access-control-expose-headers", "error, totalPages, totalCount");
    res.setHeader("error", req.header.error);
    res.setHeader("totalPages", req.header.totalPages);
    res.setHeader("totalCount", req.header.totalCount);
    next();
  }
  else next()
}

async function filter(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "seasoncalendar";
  let seasoncalendars = await seasoncalendarCtrl.filter(req.body);
  if (req.body.export) {
    req.body.data = seasoncalendars
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = seasoncalendars
    next()
  }
  else res.json(seasoncalendars);
}

