const express = require('express');
const asyncHandler = require('express-async-handler');
const leaseorderCtrl = require('../controllers/leaseorder.controller');
const commonCtrl = require('../controllers/common.controller');
const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))

router.route('/')
  .post(asyncHandler(leaseorderCtrl.getnextdocnumber), asyncHandler(insert))

router.route('/:Id')
  .put(asyncHandler(update))
  .patch(asyncHandler(patch))
  .get(asyncHandler(findbyId))

router.route('/applyleaseorder')
  .post(asyncHandler(applyleaseorder))

router.route('/filter')
  .post(asyncHandler(findcount), asyncHandler(filter), commonCtrl.exportcsv)

router.route('/search/')
  .post(asyncHandler(filter),  commonCtrl.deepobjectsearch_like);

async function findbyId(req, res) {
  let leaseorder = await leaseorderCtrl.findbyId(req.params.Id);
  res.json(leaseorder);
}

async function insert(req, res) {
  let leaseorder = await leaseorderCtrl.insert(req);
  res.json(leaseorder);
}

async function update(req, res) {
  let leaseorder = await leaseorderCtrl.update(req.params.Id, req);
  res.json(leaseorder);
}


async function patch(req, res) {
  let leaseorder = await leaseorderCtrl.patch(req.params.Id, req);
  res.json(leaseorder);
}

async function findcount(req, res, next) {
  if (req.body.size){
    await leaseorderCtrl.findcount(req);
    res.header("access-control-expose-headers", "error, totalPages, totalCount");
    res.setHeader("error", req.header.error);
    res.setHeader("totalPages", req.header.totalPages);
    res.setHeader("totalCount", req.header.totalCount);
    next();
  }
  else next()
}

async function filter(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "leaseorder";
  let leaseorders = await leaseorderCtrl.filter(req.body);
  if (req.body.export) {
    req.body.data = leaseorders
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = leaseorders
    next()
  }
  else res.json(leaseorders);
}

async function applyleaseorder(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "leaseorder";
  let leaseorders = await leaseorderCtrl.filter(req.body);
  if (leaseorders.length > 0){
    var leaseorder = leaseorders[0];
    leaseorder.value = leaseorder.property.fixvalue ? leaseorder.property.fixvalue : 0
    return res.json(leaseorder);
  }
  else {
    return res.json({});
  }

}

