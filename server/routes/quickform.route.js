const express = require('express');
const asyncHandler = require('express-async-handler');
const quickformCtrl = require('../controllers/quickform.controller');
const formfieldCtrl = require('../controllers/formfield.controller');
const formfieldoptionCtrl = require('../controllers/formfieldoption.controller');
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


router.route('/getquickformschema/:formname')
    .get(formfieldoptionCtrl.getquickformschema, formfieldCtrl.getquickformschema)

router.route('/search/')
  .post(asyncHandler(filter),  commonCtrl.deepobjectsearch_like);

async function findbyId(req, res) {
  let quickform = await quickformCtrl.findbyId(req.params.Id);
  res.json(quickform);
}

async function insert(req, res) {
  let quickform = await quickformCtrl.insert(req);
  res.json(quickform);
}

async function update(req, res) {
  let quickform = await quickformCtrl.update(req.params.Id, req);
  res.json(quickform);
}

async function patch(req, res) {
  let quickform = await quickformCtrl.patch(req.params.Id, req);
  res.json(quickform);
}

async function remove(req, res) {
  let quickform = await quickformCtrl.remove(req.params.Id, req);
  res.json(quickform);
}

async function findcount(req, res, next) {
  if (req.body.size){
    await quickformCtrl.findcount(req);
    res.header("access-control-expose-headers", "error, totalPages, totalCount");
    res.setHeader("error", req.header.error);
    res.setHeader("totalPages", req.header.totalPages);
    res.setHeader("totalCount", req.header.totalCount);
    next();
  }
  else next()
}

async function filter(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "quickform";
  let members = await quickformCtrl.filter(req.body);
  if (req.body.export) {
    req.body.data = members
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = members
    next()
  }
  else res.json(members);
}




