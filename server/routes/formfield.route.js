const express = require('express');
const asyncHandler = require('express-async-handler');
const formfieldCtrl = require('../controllers/formfield.controller');
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
  .delete(asyncHandler(remove))

router.route('/filter')
.post(asyncHandler(findcount), asyncHandler(filter), commonCtrl.exportcsv)

router.route('/removeall')
.post(asyncHandler(removeall))

async function findbyId(req, res) {
  let formfield = await formfieldCtrl.findbyId(req.params.Id);
  res.json(formfield);
}

router.route('/updateformorder')
  .post(asyncHandler(updateformorder))

async function insert(req, res) {
  let formfield = await formfieldCtrl.insert(req);
  res.json(formfield);
}

async function update(req, res) {
  let formfield = await formfieldCtrl.update(req.params.Id, req);
  res.json(formfield);
}

async function patch(req, res) {
  let formfield = await formfieldCtrl.patch(req.params.Id, req);
  res.json(formfield);
}

async function remove(req, res) {
  let formfield = await formfieldCtrl.remove(req.params.Id, req);
  //console.log("formfield", formfield);
  res.json(formfield);
}

async function removeall(req, res) {
  let formfield = await formfieldCtrl.removeall(req.body);
  //console.log("formfield", formfield);
  res.json(formfield);
}

async function filter(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "formfield";
  let formfields = await formfieldCtrl.filter(req.body);
  if (req.body.export) {
    req.body.data = formfields
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = formfields
    next()
  }
  else res.json(formfields);
}

async function updateformorder(req, res) {
  let formfields = await formfieldCtrl.updateformorder(req.body.formfields);
  res.json(formfields);
}

async function findcount(req, res, next) {
  if (req.body.size){
    await formfieldCtrl.findcount(req);
    res.header("access-control-expose-headers", "error, totalPages, totalCount");
    res.setHeader("error", req.header.error);
    res.setHeader("totalPages", req.header.totalPages);
    res.setHeader("totalCount", req.header.totalCount);
    next();
  }
  else next()
}
