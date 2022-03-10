const express = require('express');
const asyncHandler = require('express-async-handler');
const challanCtrl = require('../controllers/challan.controller');
const commonCtrl = require('../controllers/common.controller');
const templateCtrl = require('../controllers/template.controller');

const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))

router.route('/')
  .post(asyncHandler(challanCtrl.getnextdocnumber), asyncHandler(insert))

router.route('/:Id')
  .put(asyncHandler(update))
  .delete(asyncHandler(remove))
  .get(asyncHandler(findbyId))

router.route('/filter')
  .post(asyncHandler(findcount), asyncHandler(filter), commonCtrl.exportcsv)

router.route('/view/chnumber')
  .get(asyncHandler(challanCtrl.getnextdocnumber))

async function findbyId(req, res, next) {
  let challan = await challanCtrl.findbyId(req.params.Id);
  res.json(challan);
}

async function insert(req, res) {
  let challan = await challanCtrl.insert(req);
  res.json(challan);
}

async function update(req, res) {
  let challan = await challanCtrl.update(req.params.Id, req);
  res.json(challan);
}

async function remove(req, res) {
  let challan = await challanCtrl.remove(req.params.Id, req);
  res.json(challan);
}

async function findcount(req, res, next) {
  if (req.body.size){
    await challanCtrl.findcount(req);
    res.header("access-control-expose-headers", "error, totalPages, totalCount");
    res.setHeader("error", req.header.error);
    res.setHeader("totalPages", req.header.totalPages);
    res.setHeader("totalCount", req.header.totalCount);
    next();
  }
  else next()
}

async function filter(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "challan";
  let challans = await challanCtrl.filter(req.body);
  if (req.body.export) {
    req.body.data = challans
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = challans
    next()
  }
  else res.json(challans);
}
