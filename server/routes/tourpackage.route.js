const express = require('express');
const asyncHandler = require('express-async-handler');
const tourpackageCtrl = require('../controllers/tourpackage.controller');
const Tourpackageview = require('../views/tourpackage.view');
const dashboardCtrl = require('../controllers/dashboard.controller');
const commonCtrl = require('../controllers/common.controller');
const billitemCtrl = require('../controllers/billitem.controller');
const router = express.Router();
module.exports = router;

router.route('/')
  .post(asyncHandler(insert), asyncHandler(insertbillitem))

router.route('/:Id')
  .put(asyncHandler(update), asyncHandler(insertbillitem))
  .patch(asyncHandler(patch))
  .delete(asyncHandler(remove))
  .get(asyncHandler(findbyId))

router.route('/filter')
  .post(asyncHandler(findcount), asyncHandler(filter), commonCtrl.exportcsv)

router.route('/filter/view')
  .post(asyncHandler(filterview))

router.route('/search/')
  .post(asyncHandler(filter),  commonCtrl.deepobjectsearch_like);

async function insertbillitem(req, res) {
  req.body.data = req.body.tourpackage;
  req.body.category = "5e92d59adf559b3e68fd5b0a"
  req.body.itemname = req.body.title;
  await billitemCtrl.insertpackagebillitem(req);
  res.json(req.body.tourpackage);
}

async function filterview(req, res) {
  var tourpackages = await Tourpackageview.getfilterview(req.body)
  res.json(tourpackages)
}


async function findbyId(req, res) {
  let tourpackage = await tourpackageCtrl.findbyId(req.params.Id);
  res.json(tourpackage);
}

async function insert(req, res, next) {
  let tourpackage = await tourpackageCtrl.insert(req);
  req.body.tourpackage = tourpackage;
  if(req.body.status == 'publish'){
    res.json(tourpackage)
  }else{
    next();
  }
}

async function patch(req, res) {
  let tourpackage = await tourpackageCtrl.patch(req.params.Id, req);
  res.json(tourpackage);
}

async function update(req, res, next) {
  let tourpackage = await tourpackageCtrl.update(req.params.Id, req);
  req.body.tourpackage = tourpackage;
  next();
}

async function remove(req, res) {
  let tourpackage = await tourpackageCtrl.remove(req.params.Id, req);
  res.json(tourpackage);
}

async function findcount(req, res, next) {
  if (req.body.size){
    if (req.body.webpartid) {
      let ids = await dashboardCtrl.webpartfilter(req);
      req.body.search = [{ "searchfield": "_id", "searchvalue": ids, "datatype": "ObjectId", "criteria": "in" }]
    }
    await tourpackageCtrl.findcount(req);
    res.header("access-control-expose-headers", "error, totalPages, totalCount");
    res.setHeader("error", req.header.error);
    res.setHeader("totalPages", req.header.totalPages);
    res.setHeader("totalCount", req.header.totalCount);
    next();
  }
  else next()
}

async function filter(req, res, next) {
  if (req.body.webpartid) {
    let ids = await dashboardCtrl.webpartfilter(req);
    req.body.search = [{ "searchfield": "_id", "searchvalue": ids, "datatype": "ObjectId", "criteria": "in" }]
  }
  req.body.formname = req.body.formname? req.body.formname: "tourpackage";
  let tourpackagees = await tourpackageCtrl.filter(req.body);
  if (req.body.export) {
    req.body.data = tourpackagees
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = tourpackagees
    next()
  }
  else res.json(tourpackagees);
}

