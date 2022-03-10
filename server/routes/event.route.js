const express = require('express');
const asyncHandler = require('express-async-handler');
const eventCtrl = require('../controllers/event.controller');
const formdataCtrl = require('../controllers/formdata.controller');
const billitemCtrl = require('../controllers/billitem.controller');
const groupclassCtrl = require('../controllers/groupclass.controller');
const commonCtrl = require('../controllers/common.controller');
const router = express.Router();
module.exports = router;

var ObjectID = require('mongodb').ObjectID;

router.route('/')
  .post(asyncHandler(convertdatatype), asyncHandler(insertgroupclass), asyncHandler(insert), asyncHandler(insertbillitem))

router.route('/:Id')
  .put(asyncHandler(convertdatatype), asyncHandler(update), asyncHandler(insertbillitem))
  .patch(asyncHandler(patch))
  .delete(asyncHandler(remove))
  .get(asyncHandler(findbyId))

router.route('/filter')
  .post(asyncHandler(findcount), asyncHandler(filter), commonCtrl.exportcsv)

router.route('/filter/view')
  .post(asyncHandler(filterview))

router.route('/search/')
  .post(asyncHandler(filter),  commonCtrl.deepobjectsearch_like);

async function findbyId(req, res) {
  let event = await eventCtrl.findbyId(req.params.Id);
  res.json(event);
}


async function insertgroupclass(req, res,next) {
  if(req.body.property.type == 'program'){
    let groupclass = await groupclassCtrl.insert(req);
    req.body.groupid = ObjectID(groupclass._id).toString();
    next();
  }else{
    next();
  }
}

async function insertbillitem(req, res,next ) {

  req.body.data = req.body.event;
  req.body.category = "5e92d59adf559b3e68fd5b0a"
  req.body.itemname = req.body.event.title;
  await billitemCtrl.inserteventbillitem(req);
  res.json(req.body.event);
}

async function insert(req, res, next) {
  let event = await eventCtrl.insert(req);
  req.body.event = event;
  next();
}

async function update(req, res, next) {
  let event = await eventCtrl.update(req.params.Id, req);
  req.body.event = event;
  next()
}

async function filterview(req, res, next) {
  let event = await eventCtrl.filterview(req.body);
  res.json(event);
}

async function remove(req, res) {
  let event = await eventCtrl.remove(req.params.Id, req);
  res.json(event);
}

async function patch(req, res) {
  let event = await eventCtrl.patch(req.params.Id, req);
  res.json(event);
}

async function convertdatatype(req, res, next) {
  req.body.formid = "5a7d6a95ce475301a022c673";
  await formdataCtrl.convertdatatype(req, res, next);
}

async function findcount(req, res, next) {
  if (req.body.size){
    await eventCtrl.findcount(req);
    res.header("access-control-expose-headers", "error, totalPages, totalCount");
    res.setHeader("error", req.header.error);
    res.setHeader("totalPages", req.header.totalPages);
    res.setHeader("totalCount", req.header.totalCount);
    next();
  }
  else next()
}

async function filter(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "event";
  let events = await eventCtrl.filter(req.body);
  if (req.body.export) {
    req.body.data = events
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = events
    next()
  }
  else res.json(events);
}

