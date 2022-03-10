const express = require('express');
const asyncHandler = require('express-async-handler');
const documentCtrl = require('../controllers/document.controller');
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

router.route('/filter')
  .post(asyncHandler(findcount), asyncHandler(filter), commonCtrl.exportcsv)

router.route('/filter/view')
  .post(asyncHandler(filterview))

router.route('/search/')
  .post(asyncHandler(filter),  commonCtrl.deepobjectsearch_like);

async function findbyId(req, res) {
  let document = await documentCtrl.findbyId(req.params.Id);
  res.json(document);
}

async function insert(req, res) {
  let document = await documentCtrl.insert(req);
  res.json(document);
}

async function update(req, res) {
  let document = await documentCtrl.update(req.params.Id, req);
  res.json(document);
}

async function patch(req, res) {
  let document = await documentCtrl.patch(req.params.Id, req);
  res.json(document);
}

async function remove(req, res) {
  let document = await documentCtrl.remove(req.params.Id, req);
  res.json(document);
}

async function findcount(req, res, next) {
  if (req.body.size){
    await documentCtrl.findcount(req);
    res.header("access-control-expose-headers", "error, totalPages, totalCount");
    res.setHeader("error", req.header.error);
    res.setHeader("totalPages", req.header.totalPages);
    res.setHeader("totalCount", req.header.totalCount);
    next();
  }
  else next()
}

async function filter(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "document";
  let documents = await documentCtrl.filter(req.body);
  if (req.body.export) {
    req.body.data = documents
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = documents
    next()
  }
  else res.json(documents);
}

async function filterview(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "document";
  let documents = await documentCtrl.filterview(req);
  res.json(documents);
}
