const express = require('express');
const asyncHandler = require('express-async-handler');
const folderCtrl = require('../controllers/folder.controller');
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

router.route('/search/')
  .post(asyncHandler(filter),  commonCtrl.deepobjectsearch_like);

async function findbyId(req, res) {
  let folder = await folderCtrl.findbyId(req.params.Id);
  res.json(folder);
}

async function insert(req, res) {
  let folder = await folderCtrl.insert(req);
  res.json(folder);
}

async function update(req, res) {
  let folder = await folderCtrl.update(req.params.Id, req);
  res.json(folder);
}

async function patch(req, res) {
  let folder = await folderCtrl.patch(req.params.Id, req);
  res.json(folder);
}

async function remove(req, res) {
  let folder = await folderCtrl.remove(req.params.Id, req);
  res.json(folder);
}

async function findcount(req, res, next) {
  if (req.body.size){
    await folderCtrl.findcount(req);
    res.header("access-control-expose-headers", "error, totalPages, totalCount");
    res.setHeader("error", req.header.error);
    res.setHeader("totalPages", req.header.totalPages);
    res.setHeader("totalCount", req.header.totalCount);
    next();
  }
  else next()
}

async function filter(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "folder";
  let folders = await folderCtrl.filter(req.body);
  if (req.body.export) {
    req.body.data = folders
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = folders
    next()
  }
  else res.json(folders);
}

