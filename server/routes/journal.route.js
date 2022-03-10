const express = require('express');
const asyncHandler = require('express-async-handler');
const journalCtrl = require('../controllers/journal.controller');
const journalledgerCtrl = require('../controllers/journalledger.controller');
const commonCtrl = require('../controllers/common.controller');
const router = express.Router();
module.exports = router;

router.route('/')
  .post(asyncHandler(insert))

// router.route('/:Id')
//   .put(asyncHandler(update))
//   .delete(asyncHandler(remove))
//   .get(asyncHandler(findbyId))

router.route('/filter')
  .post(asyncHandler(findcount), asyncHandler(filter), commonCtrl.exportcsv)

router.route('/search/')
  .post(asyncHandler(filter),  commonCtrl.deepobjectsearch_like);

router.route('/openingbalance')
    .get(asyncHandler(journalCtrl.getOpeningbalance))
    .post(asyncHandler(journalCtrl.create), asyncHandler(journalledgerCtrl.createOpeningbalance))

router.route('/openingbalance/:Id')
    .put(journalCtrl.update, journalledgerCtrl.updateOpeningbalance)


async function findbyId(req, res) {
  let journal = await journalCtrl.findbyId(req.params.Id);
  res.json(journal);
}

async function insert(req, res) {
  let journal = await journalCtrl.insert(req);
  res.json(journal);
}

async function update(req, res) {
  let journal = await journalCtrl.update(req.params.Id, req);
  res.json(journal);
}

async function remove(req, res) {
  let journal = await journalCtrl.remove(req.params.Id, req);
  res.json(journal);
}

async function findcount(req, res, next) {
  if (req.body.size){
    await journalCtrl.findcount(req);
    res.header("access-control-expose-headers", "error, totalPages, totalCount");
    res.setHeader("error", req.header.error);
    res.setHeader("totalPages", req.header.totalPages);
    res.setHeader("totalCount", req.header.totalCount);
    next();
  }
  else next()
}

async function filter(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "journal";
  let journals = await journalCtrl.filter(req.body);
  if (req.body.export) {
    req.body.data = journals;
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = journals;
    next()
  }
  else res.json(journals);
}

