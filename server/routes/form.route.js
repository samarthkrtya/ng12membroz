const express = require('express');
const asyncHandler = require('express-async-handler');
const formCtrl = require('../controllers/form.controller');
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

router.route('/filter')
.post(asyncHandler(findcount), asyncHandler(filter), commonCtrl.exportcsv)

router.route('/filter/view')
  .post(asyncHandler(integrationview))

router.route('/filter/inspection/view')
  .post(asyncHandler(inspectionfilterview))

router.route('/search/')
  .post(asyncHandler(findcount), asyncHandler(filter),  commonCtrl.deepobjectsearch_like);

async function findbyId(req, res) {
  let form = await formCtrl.findbyId(req.params.Id);
  res.json(form);
}

async function insert(req, res) {
  let form = await formCtrl.insert(req);
  res.json(form);
}

async function update(req, res) {
  let form = await formCtrl.update(req.params.Id, req);
  res.json(form);
}

async function patch(req, res) {
  let form = await formCtrl.patch(req.params.Id, req);
  res.json(form);
}

async function remove(req, res) {
  let challan = await formCtrl.remove(req.params.Id, req);
  res.json(challan);
}

async function findcount(req, res, next) {
  if (req.body.size){
    await formCtrl.findcount(req);
    res.header("access-control-expose-headers", "error, totalPages, totalCount");
    res.setHeader("error", req.header.error);
    res.setHeader("totalPages", req.header.totalPages);
    res.setHeader("totalCount", req.header.totalCount);
    next();
  }
  else next()
}

async function filter(req, res, next) {

  req.body.formname = req.body.formname? req.body.formname: "form";
  let forms = await formCtrl.filter(req.body);
  if (req.body.export) {
    req.body.data = forms;
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = forms;
    next()
  }
  else res.json(forms);

}

async function inspectionfilterview(req, res, next) {
  let inspections = await formCtrl.inspectionfilterview(req.body);
  res.json(inspections);
}

async function integrationview(req, res) {
  let forms = await formCtrl.integrationview(req.body);
  res.json(forms);
}
