const express = require('express');
const asyncHandler = require('express-async-handler');
const weekschedule = require('../controllers/weekschedule.controller');
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

router.route('/filter/view')
  .post(asyncHandler(filterview))

router.route('/filter')
  .post(asyncHandler(findcount), asyncHandler(filter), commonCtrl.exportcsv)

router.route('/search/')
  .post(asyncHandler(filter),  commonCtrl.deepobjectsearch_like);

async function findbyId(req, res) {
  let saleschannelteam = await weekschedule.findbyId(req.params.Id);
  res.json(saleschannelteam);
}

async function insert(req, res) {
  let saleschannelteam = await weekschedule.insert(req);
  res.json(saleschannelteam);
}

async function patch(req, res) {
  let weekschedules = await weekschedule.patch(req.params.Id, req);
  res.json(weekschedules);
}


async function update(req, res) {
  let saleschannelteam = await weekschedule.update(req.params.Id, req);
  res.json(saleschannelteam);
}

async function remove(req, res) {
  let saleschannelteam = await weekschedule.remove(req.params.Id, req);
  res.json(saleschannelteam);
}

async function findcount(req, res, next) {
  if (req.body.size){
    await weekschedule.findcount(req);
    res.header("access-control-expose-headers", "error, totalPages, totalCount");
    res.setHeader("error", req.header.error);
    res.setHeader("totalPages", req.header.totalPages);
    res.setHeader("totalCount", req.header.totalCount);
    next();
  }
  else next()
}

async function filter(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "weekschedule";
  let weekschedules = await weekschedule.filter(req.body);
  if (req.body.export) {
    req.body.data = weekschedules
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = weekschedules
    next()
  }
  else res.json(weekschedules);
}


async function filterview(req, res, next) {

  req.body.formname = req.body.formname? req.body.formname: "weekschedule";
  let weekschedules = await weekschedule.filterview(req.body);
  res.json(weekschedules);
}

