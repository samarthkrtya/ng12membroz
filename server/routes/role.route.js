const express = require('express');
const asyncHandler = require('express-async-handler');
const roleCtrl = require('../controllers/role.controller');
const commonCtrl = require('../controllers/common.controller');
const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))

router.route('/')
  .post(asyncHandler(insert))

router.route('/:Id')
  .put(asyncHandler(update))
  .patch(asyncHandler(patch))
  .delete(asyncHandler(remove))
  .get(asyncHandler(findbyId))

router.route('/customized/:Id')
  .put(asyncHandler(customizedupdate))

router.route('/filter')
  .post(asyncHandler(findcount), asyncHandler(filter), commonCtrl.exportcsv)

router.route('/filter/view')
  .post(asyncHandler(filterview))

router.route('/search/')
  .post(asyncHandler(filter),  commonCtrl.deepobjectsearch_like);

async function findbyId(req, res) {
  let role = await roleCtrl.findbyId(req.params.Id);
  res.json(role);
}

async function insert(req, res) {
  let role = await roleCtrl.insert(req);
  res.json(role);
}

async function update(req, res) {
  let role = await roleCtrl.update(req.params.Id, req);
  res.json(role);
}

async function patch(req, res) {
  let role = await roleCtrl.patch(req.params.Id, req);
  res.json(role);
}

async function customizedupdate(req, res) {
  //console.log(req.body)
  let role = await roleCtrl.update(req.params.Id, req);
  res.json(role);
}

async function remove(req, res) {
  let role = await roleCtrl.remove(req.params.Id, req);
  res.json(role);
}

async function findcount(req, res, next) {
  if (req.body.size){
    await roleCtrl.findcount(req);
    res.header("access-control-expose-headers", "error, totalPages, totalCount");
    res.setHeader("error", req.header.error);
    res.setHeader("totalPages", req.header.totalPages);
    res.setHeader("totalCount", req.header.totalCount);
    next();
  }
  else next()
}

async function filter(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "role";
  let roles = await roleCtrl.filter(req.body);
  if (req.body.export) {
    req.body.data = roles
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = roles
    next()
  }
  else res.json(roles);
}

async function filterview(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "role";
  let roles = await roleCtrl.filterview(req.body);
  res.json(roles);
}
