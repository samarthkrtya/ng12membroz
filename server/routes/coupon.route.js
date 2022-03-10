const express = require('express');
const asyncHandler = require('express-async-handler');
const couponCtrl = require('../controllers/coupon.controller');
const commonCtrl = require('../controllers/common.controller');
const billpaymentCtrl = require('../controllers/billpayment.controller');
const preprocess = require('../middleware/preprocess');
const formdataCtrl = require('../controllers/formdata.controller');
const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))

router.route('/')
  .post(asyncHandler(validatedata), asyncHandler(insert))

router.route('/:Id')
  .put(asyncHandler(validatedata), asyncHandler(update))
  .get(asyncHandler(findbyId))
  .delete(asyncHandler(remove))

router.route('/applycoupon')
  .post(asyncHandler(applycoupon))

router.route('/filter')
  .post(asyncHandler(findcount), asyncHandler(filter), commonCtrl.exportcsv)

router.route('/view/filter')
  .post(asyncHandler(findcount), asyncHandler(viewfilter), commonCtrl.exportcsv)

router.route('/checkvalidity')
  .post(asyncHandler(checkvalidity), commonCtrl.exportcsv)


router.route('/search/')
  .post(asyncHandler(filter),  commonCtrl.deepobjectsearch_like);

async function findbyId(req, res) {
  let coupon = await couponCtrl.findbyId(req.params.Id);
  res.json(coupon);
}

async function insert(req, res) {
  let coupon = await couponCtrl.insert(req);
  res.json(coupon);
}

async function update(req, res) {
  let coupon = await couponCtrl.update(req.params.Id, req);
  res.json(coupon);
}

async function validatedata(req, res, next) {
  req.body.formid = "5c654586a6ae2f2dcc76d3ba";
  await formdataCtrl.validatedata(req, res, next);
}

async function findcount(req, res, next) {
  if (req.body.size){
    await couponCtrl.findcount(req);
    res.header("access-control-expose-headers", "error, totalPages, totalCount");
    res.setHeader("error", req.header.error);
    res.setHeader("totalPages", req.header.totalPages);
    res.setHeader("totalCount", req.header.totalCount);
    next();
  }
  else next()
}

async function filter(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "coupon";
  let coupons = await couponCtrl.filter(req.body);
  if (req.body.export) {
    req.body.data = coupons
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = coupons
    next()
  }
  else res.json(coupons);
}

async function remove(req, res) {
  let coupons = await couponCtrl.remove(req.params.Id, req);
  res.json(coupons);
}

async function applycoupon(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "coupon";
  var billamount = req.body.billamount;
  let coupons = await couponCtrl.filter(req.body);
  
  if (coupons.length > 0){
    var coupon = coupons[0];
    
    if(coupon.coupontype == 'Percentage'){
      coupon.value = (billamount * coupon.property.value)/100;
    }else{
      coupon.value = coupon.property.value ? coupon.property.value : 0;
    }
    return res.json(coupon);
  }
  else {
    return res.json({});
  }

}

async function checkvalidity(req, res) {
  req.body.formname = req.body.formname ? req.body.formname : "coupon";
  let coupons = [];
  coupons = await couponCtrl.checkvalidity(req, res);  
  res.json(coupons);
}


async function viewfilter(req, res, next) {
  req.body.formname = req.body.formname ? req.body.formname : "coupon";
  var viewname = req.body.viewname;
  let coupons = [];
  if (viewname) {
    coupons = await commonCtrl.viewfilter(req, res);
  }
  if (req.body.export) {
    req.body.data = coupons
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = coupons
    next()
  }
  else res.json(coupons);
}

