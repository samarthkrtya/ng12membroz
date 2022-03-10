const express = require('express');
const asyncHandler = require('express-async-handler');
const activitytemplateCtrl = require('../controllers/activitytemplate.controller');
const commonCtrl = require('../controllers/common.controller');
const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))

router.route('/')
  .post(asyncHandler(insert))

router.route('/:Id')
  .put(asyncHandler(update))
  .patch(asyncHandler(patch))
  .get(asyncHandler(findbyId))

router.route('/filter')
.post(asyncHandler(findcount), asyncHandler(filter), commonCtrl.exportcsv)

async function findbyId(req, res) {
  let activitytemplate = await activitytemplateCtrl.findbyId(req.params.Id);
  res.json(activitytemplate);
}

async function insert(req, res) {
  let activitytemplate = await activitytemplateCtrl.insert(req);
  res.json(activitytemplate);
}

async function update(req, res) {
  let activitytemplate = await activitytemplateCtrl.update(req.params.Id, req);
  res.json(activitytemplate);
}

async function patch(req, res) {
  let activitytemplate = await activitytemplateCtrl.patch(req.params.Id, req);
  res.json(activitytemplate);
}

async function filter(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "activitytemplate";
  let activitytemplates = await activitytemplateCtrl.filter(req.body);
  if (req.body.export) {
    req.body.data = activitytemplates;
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = activitytemplates;
    next()
  }
  else res.json(activitytemplates);
}

async function findcount(req, res, next) {
  if (req.body.size){
    await activitytemplateCtrl.findcount(req);
    res.header("access-control-expose-headers", "error, totalPages, totalCount");
    res.setHeader("error", req.header.error);
    res.setHeader("totalPages", req.header.totalPages);
    res.setHeader("totalCount", req.header.totalCount);
    next();
  }
  else next()
}
