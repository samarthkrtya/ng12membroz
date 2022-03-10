const express = require('express');
const asyncHandler = require('express-async-handler');
const joborderCtrl = require('../controllers/joborder.controller');
const activityCtrl = require('../controllers/activity.controller');
const commonCtrl = require('../controllers/common.controller');
const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))

router.route('/')
  .post(asyncHandler(joborderCtrl.getnextdocnumber), asyncHandler(insert))

router.route('/:Id')
  .put(asyncHandler(update), asyncHandler(updatetasks))
  .patch(asyncHandler(patch), asyncHandler(updatetasks))
  .delete(asyncHandler(remove))
  .get(asyncHandler(findbyId))

router.route('/applyjoborder')
  .post(asyncHandler(applyjoborder))

router.route('/filter')
  .post(asyncHandler(findcount), asyncHandler(filter), commonCtrl.exportcsv)

router.route('/search/')
  .post(asyncHandler(filter),  commonCtrl.deepobjectsearch_like);

router.route('/filter/view')
  .post(asyncHandler(filterview))

async function findbyId(req, res) {
  let joborder = await joborderCtrl.findbyId(req.params.Id);
  res.json(joborder);
}

async function insert(req, res) {
  let joborder = await joborderCtrl.insert(req);
  res.json(joborder);
}

async function updatetasks(req, res) {
  let tasks = await activityCtrl.updatetasks(req);
  res.json(req.body.joborder);
}

async function remove(req, res) {
  let joborder = await joborderCtrl.remove(req.params.Id, req);
  res.json(joborder);
}

async function update(req, res, next) {
  let joborder = await joborderCtrl.update(req.params.Id, req);
  req.body.joborder = joborder;
  next();
}


async function patch(req, res, next) {
  let joborder = await joborderCtrl.patch(req.params.Id, req);
  req.body.joborder = joborder;
  next();
  //res.json(joborder);
}

async function findcount(req, res, next) {
  if (req.body.size){
    await joborderCtrl.findcount(req);
    res.header("access-control-expose-headers", "error, totalPages, totalCount");
    res.setHeader("error", req.header.error);
    res.setHeader("totalPages", req.header.totalPages);
    res.setHeader("totalCount", req.header.totalCount);
    next();
  }
  else next()
}

async function filterview(req, res, next) {
  let joborder = await joborderCtrl.filterview(req.body);
  res.json(joborder);
}

async function filter(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "joborder";
  let joborders = await joborderCtrl.filter(req.body);
  if (req.body.export) {
    req.body.data = joborders
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = joborders
    next()
  }
  else res.json(joborders);
}

async function applyjoborder(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "joborder";
  let joborders = await joborderCtrl.filter(req.body);
  if (joborders.length > 0){
    var joborder = joborders[0];
    joborder.value = joborder.property.fixvalue ? joborder.property.fixvalue : 0
    return res.json(joborder);
  }
  else {
    return res.json({});
  }

}

