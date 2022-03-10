const express = require('express');
const asyncHandler = require('express-async-handler');
const supportCtrl = require('../controllers/support.controller');
const commonCtrl = require('../controllers/common.controller');
const router = express.Router();
module.exports = router;

router.route('/')
  .post(asyncHandler(supportCtrl.getnextdocnumber),asyncHandler(insert))

router.route('/:Id')
  .put(asyncHandler(update))
  .patch(asyncHandler(patch))
  .delete(asyncHandler(remove))
  .get(asyncHandler(findbyId))

router.route('/filter')
  .post(asyncHandler(findcount), asyncHandler(filter), commonCtrl.exportcsv)

router.route('/search/')
  .post(asyncHandler(filter),  commonCtrl.deepobjectsearch_like);

router.route('/view/spnumber')
  .get(asyncHandler(supportCtrl.getnextdocnumber))

async function findbyId(req, res) {
  let support = await supportCtrl.findbyId(req.params.Id);
  res.json(support);
}

async function insert(req, res) {
  let support = await supportCtrl.insert(req);
  res.json(support);
}

async function update(req, res) {
  let support = await supportCtrl.update(req.params.Id, req);
  res.json(support);
}

async function patch(req, res) {
  let support = await supportCtrl.patch(req.params.Id, req);
  res.json(support);
}

async function remove(req, res) {
  let support = await supportCtrl.remove(req.params.Id, req);
  res.json(support);
}

async function findcount(req, res, next) {
  if (req.body.size){
    await supportCtrl.findcount(req);
    res.header("access-control-expose-headers", "error, totalPages, totalCount");
    res.setHeader("error", req.header.error);
    res.setHeader("totalPages", req.header.totalPages);
    res.setHeader("totalCount", req.header.totalCount);
    next();
  }
  else next()
}

async function filter(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "support";
  let supports = await supportCtrl.filter(req.body);
  if (req.body.export) {
    req.body.data = supports
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = supports
    next()
  }
  else res.json(supports);
}

