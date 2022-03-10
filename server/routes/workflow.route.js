const express = require('express');
const asyncHandler = require('express-async-handler');
const workflowCtrl = require('../controllers/workflow.controller');
const commonCtrl = require('../controllers/common.controller');
const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))

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
  let workflow = await workflowCtrl.findbyId(req.params.Id);
  res.json(workflow);
}

async function insert(req, res) {
  let workflow = await workflowCtrl.insert(req);
  res.json(workflow);
}

async function update(req, res) {
  let workflow = await workflowCtrl.update(req.params.Id, req);
  res.json(workflow);
}

async function remove(req, res) {
  let workflow = await workflowCtrl.remove(req.params.Id, req);
  res.json(workflow);
}

async function findcount(req, res, next) {
  if (req.body.size){
    await workflowCtrl.findcount(req);
    res.header("access-control-expose-headers", "error, totalPages, totalCount");
    res.setHeader("error", req.header.error);
    res.setHeader("totalPages", req.header.totalPages);
    res.setHeader("totalCount", req.header.totalCount);
    next();
  }
  else next()
}

async function filter(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "workflow";
  let workflows = await workflowCtrl.filter(req.body);
  if (req.body.export) {
    req.body.data = workflows
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = workflows
    next()
  }
  else res.json(workflows);
}
