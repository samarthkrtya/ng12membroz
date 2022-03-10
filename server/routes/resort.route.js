const express = require('express');
const asyncHandler = require('express-async-handler');
const resortCtrl = require('../controllers/resort.controller');
const commonCtrl = require('../controllers/common.controller');
const billitemCtrl = require('../controllers/billitem.controller');
const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))

router.route('/')
  .post(asyncHandler(insert), asyncHandler(insertbillitem))

router.route('/:Id')
  .put(asyncHandler(update), asyncHandler(insertbillitem))
  .delete(asyncHandler(remove))
  .get(asyncHandler(findbyId))

router.route('/filter')
  .post(asyncHandler(findcount), asyncHandler(filter), commonCtrl.exportcsv)

router.route('/search/')
  .post(asyncHandler(filter),  commonCtrl.deepobjectsearch_like);

async function findbyId(req, res) {
  let resort = await resortCtrl.findbyId(req.params.Id);
  res.json(resort);
}

async function insertbillitem(req, res) {

  req.body.data = req.body.resort;
  req.body.category = "5e92d59adf559b3e68fd5b0a"
  req.body.itemname = req.body.resort.resortname;
  await billitemCtrl.insertroombillitem(req);
  res.json(req.body.resort);

}

async function insert(req, res, next) {
  let resort = await resortCtrl.insert(req);
  req.body.resort = resort;
  next();
}

async function update(req, res, next) {
  let resort = await resortCtrl.update(req.params.Id, req);
  req.body.resort = resort;
  next();
}

async function remove(req, res) {
  let resort = await resortCtrl.remove(req.params.Id, req);
  res.json(resort);
}

async function findcount(req, res, next) {
  if (req.body.size){
    await resortCtrl.findcount(req);
    res.header("access-control-expose-headers", "error, totalPages, totalCount");
    res.setHeader("error", req.header.error);
    res.setHeader("totalPages", req.header.totalPages);
    res.setHeader("totalCount", req.header.totalCount);
    next();
  }
  else next()
}

async function filter(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "resort";
  let resorts = await resortCtrl.filter(req.body);
  if (req.body.export) {
    req.body.data = resorts
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = resorts
    next()
  }
  else res.json(resorts);
}
