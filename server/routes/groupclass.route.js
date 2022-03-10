const express = require('express');
const asyncHandler = require('express-async-handler');
const groupclassCtrl = require('../controllers/groupclass.controller');
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
  let groupclass = await groupclassCtrl.findbyId(req.params.Id);
  res.json(groupclass);
}

async function insert(req, res) {
  let groupclass = await groupclassCtrl.insert(req);
  res.json(groupclass);
}

async function update(req, res) {
  let groupclass = await groupclassCtrl.update(req.params.Id, req);
  res.json(groupclass);
}

async function patch(req, res) {
  let groupclass = await groupclassCtrl.patch(req.params.Id, req);
  res.json(groupclass);
}


async function remove(req, res) {
  let groupclass = await groupclassCtrl.remove(req.params.Id, req);
  res.json(groupclass);
}

async function findcount(req, res, next) {
  if (req.body.size){
    await groupclassCtrl.findcount(req);
    res.header("access-control-expose-headers", "error, totalPages, totalCount");
    res.setHeader("error", req.header.error);
    res.setHeader("totalPages", req.header.totalPages);
    res.setHeader("totalCount", req.header.totalCount);
    next();
  }
  else next()
}

async function filter(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "groupclass";
  let groupclasss = await groupclassCtrl.filter(req.body);
  if (req.body.export) {
    req.body.data = groupclasss;
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = groupclasss;
    next()
  }
  else res.json(groupclasss);
}

async function filterview(req, res, next) {
  let groupclasss = await groupclassCtrl.filterview(req.body);
  res.json(groupclasss);
}

