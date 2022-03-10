const express = require('express');
const asyncHandler = require('express-async-handler');
const templateCtrl = require('../controllers/template.controller');
const commonCtrl = require('../controllers/common.controller');
const preprocess = require('../middleware/preprocess');
const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))

router.route('/')
  .post(asyncHandler(preprocess.processMember), asyncHandler(insert))

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
  let template = await templateCtrl.findbyId(req.params.Id);
  res.json(template);
}

async function insert(req, res) {
  let template = await templateCtrl.insert(req);
  res.json(template);
}

async function update(req, res) {
  let template = await templateCtrl.update(req.params.Id, req);
  res.json(template);
}

async function patch(req, res) {
  let template = await templateCtrl.patch(req.params.Id, req);
  res.json(template);
}

async function remove(req, res) {
  let template = await templateCtrl.remove(req.params.Id, req);
  res.json(template);
}

async function findcount(req, res, next) {
  if (req.body.size){
    await templateCtrl.findcount(req);
    res.header("access-control-expose-headers", "error, totalPages, totalCount");
    res.setHeader("error", req.header.error);
    res.setHeader("totalPages", req.header.totalPages);
    res.setHeader("totalCount", req.header.totalCount);
    next();
  }
  else next()
}

async function filter(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "template";
  let templates = await templateCtrl.filter(req.body);
  if (req.body.export) {
    req.body.data = templates
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = templates
    next()
  }
  else res.json(templates);
}



