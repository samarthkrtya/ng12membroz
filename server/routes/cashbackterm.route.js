const express = require('express');
const asyncHandler = require('express-async-handler');
const cashbacktermCtrl = require('../controllers/cashbackterm.controller');
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

async function findbyId(req, res) {
  let cashbackterm = await cashbacktermCtrl.findbyId(req.params.Id);
  res.json(cashbackterm);
}

async function insert(req, res) {
  let cashbackterm = await cashbacktermCtrl.insert(req);
  res.json(cashbackterm);
}

async function update(req, res) {
  let cashbackterm = await cashbacktermCtrl.update(req.params.Id, req);
  res.json(cashbackterm);
}

async function remove(req, res) {
  let cashbackterm = await cashbacktermCtrl.remove(req.params.Id, req);
  res.json(cashbackterm);
}

async function filterview(req, res, next) {
  let cashbackterms = await cashbacktermCtrl.filterview(req.body);
  res.json(cashbackterms);
}

async function findcount(req, res, next) {
  if (req.body.size){
    await cashbacktermCtrl.findcount(req);
    res.header("access-control-expose-headers", "error, totalPages, totalCount");
    res.setHeader("error", req.header.error);
    res.setHeader("totalPages", req.header.totalPages);
    res.setHeader("totalCount", req.header.totalCount);
    next();
  }
  else next()
}

async function filter(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "cashbackterm";
  let cashbackterms = await cashbacktermCtrl.filter(req.body);
  if (req.body.export) {
    req.body.data = cashbackterms
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = cashbackterms
    next()
  }
  else res.json(cashbackterms);
}
