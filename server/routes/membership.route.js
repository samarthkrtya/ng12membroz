const express = require('express');
const asyncHandler = require('express-async-handler');
const membershipCtrl = require('../controllers/membership.controller');
const paymenttermCtrl = require('../controllers/paymentterm.controller');
const commonCtrl = require('../controllers/common.controller');
const preprocess = require('../middleware/preprocess');
const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))

router.route('/')
  .post(asyncHandler(preprocess.processMember), asyncHandler(insert), asyncHandler(insertpaymentterms))

router.route('/:Id')
  .put(asyncHandler(update))
  .patch(asyncHandler(patch))
  .delete(asyncHandler(remove))
  .get(asyncHandler(findbyId))

router.route('/filter')
  .post(asyncHandler(findcount), asyncHandler(filter), commonCtrl.exportcsv)

router.route('/filter/view')
  .post(asyncHandler(filterview))

router.route('/view/filter')
  .post(asyncHandler(findcount), asyncHandler(viewfilter), commonCtrl.exportcsv)

router.route('/search/')
  .post(asyncHandler(filter), commonCtrl.deepobjectsearch_like);

async function findbyId(req, res) {
  let membership = await membershipCtrl.findbyId(req.params.Id);
  res.json(membership);
}

async function insert(req, res, next) {
  let membership = await membershipCtrl.insert(req);
  req.body.membership = membership;
  next()
}

async function insertpaymentterms(req, res) {
  let membership = await paymenttermCtrl.insertpaymentterms(req);
  res.json(membership);
}

async function patch(req, res) {
  let membership = await membershipCtrl.patch(req.params.Id, req);
  res.json(membership);
}

async function update(req, res) {
  let membership = await membershipCtrl.update(req.params.Id, req);
  res.json(membership);
}

async function remove(req, res) {
  let membership = await membershipCtrl.remove(req.params.Id, req);
  res.json(membership);
}

async function findcount(req, res, next) {
  if (req.body.size) {
    await membershipCtrl.findcount(req);
    res.header("access-control-expose-headers", "error, totalPages, totalCount");
    res.setHeader("error", req.header.error);
    res.setHeader("totalPages", req.header.totalPages);
    res.setHeader("totalCount", req.header.totalCount);
    next();
  }
  else next()
}

async function filter(req, res, next) {
  req.body.formname = req.body.formname ? req.body.formname : "membership";
  let memberships = await membershipCtrl.filter(req.body);
  if (req.body.export) {
    req.body.data = memberships
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = memberships;
    next()
  }
  else res.json(memberships);
}

async function filterview(req, res, next) {
  let memberships = await membershipCtrl.filterview(req.body);
  res.json(memberships);
}

async function viewfilter(req, res, next) {

  req.body.formname = req.body.formname ? req.body.formname : "membership";
  var viewname = req.body.viewname;
  let memberships;
  if (viewname) {
    memberships = await commonCtrl.viewfilter(req, res);
  }
  else {
    memberships = await membershipCtrl.viewfilter(req.body);
  }
  if (req.body.export) {
    req.body.data = memberships
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = memberships;
    next()
  }
  else res.json(memberships);
}
