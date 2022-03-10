const express = require('express');
const asyncHandler = require('express-async-handler');
const salarycomponentCtrl = require('../controllers/salarycomponent.controller');
const commonCtrl = require('../controllers/common.controller');
const router = express.Router();
module.exports = router;

router.route('/')
  .post(asyncHandler(insert))

router.route('/:Id')
  .put(asyncHandler(update))
  .delete(asyncHandler(remove))
  .get(asyncHandler(findbyId))

  router.route('/deletemultiple')
  .post(asyncHandler(deletemultiple))  

router.route('/filter')
  .post(asyncHandler(findcount), asyncHandler(filter), commonCtrl.exportcsv)

router.route('/search/')
  .post(asyncHandler(filter),  commonCtrl.deepobjectsearch_like);

async function findbyId(req, res) {
  let salarycomponent = await salarycomponentCtrl.findbyId(req.params.Id);
  res.json(salarycomponent);
}

async function insert(req, res) {
  let salarycomponent = await salarycomponentCtrl.insert(req);
  res.json(salarycomponent);
}

async function update(req, res) {
  let salarycomponent = await salarycomponentCtrl.update(req.params.Id, req);
  res.json(salarycomponent);
}

async function remove(req, res) {
  let salarycomponent = await salarycomponentCtrl.remove(req.params.Id, req);
  res.json(salarycomponent);
}

async function deletemultiple(req, res) {

  let salarycomponent = await salarycomponentCtrl.deletemultiple(req.params.Id,req);
  res.json(salarycomponent);
}

async function findcount(req, res, next) {
  if (req.body.size){
    await salarycomponentCtrl.findcount(req);
    res.header("access-control-expose-headers", "error, totalPages, totalCount");
    res.setHeader("error", req.header.error);
    res.setHeader("totalPages", req.header.totalPages);
    res.setHeader("totalCount", req.header.totalCount);
    next();
  }
  else next()
}

async function filter(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "salarycomponent";
  //console.log(req.body)
  let salarycomponents = await salarycomponentCtrl.filter(req.body);
  if (req.body.export) {
    req.body.data = salarycomponents
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = salarycomponents
    next()
  }
  else res.json(salarycomponents);
}

