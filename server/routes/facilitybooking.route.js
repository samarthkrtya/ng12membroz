const express = require('express');
const asyncHandler = require('express-async-handler');
const facilitybookingCtrl = require('../controllers/facilitybooking.controller');
const billCtrl = require('../controllers/bill.controller');
const commonCtrl = require('../controllers/common.controller');
const membershipusageCtrl = require('../controllers/membershipusage.controller');
const dashboardCtrl = require('../controllers/dashboard.controller');
const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))

router.route('/')
  .post(asyncHandler(facilitybookingCtrl.getnextdocnumber), asyncHandler(insert), asyncHandler(billCtrl.getnextdocnumber), asyncHandler(getmembershipdiscount), asyncHandler(updatebill))

router.route('/:Id')
  .put(asyncHandler(update), asyncHandler(billCtrl.getnextdocnumber), asyncHandler(getmembershipdiscount), asyncHandler(updatebill))
  .patch(asyncHandler(patch))
  .delete(asyncHandler(remove))
  .get(asyncHandler(findbyId))

router.route('/filter')
  .post(asyncHandler(findcount), asyncHandler(filter), commonCtrl.exportcsv)

router.route('/search/')
  .post(asyncHandler(filter),  commonCtrl.deepobjectsearch_like);

router.route('/multi')
  .post(
    asyncHandler(facilitybookingCtrl.getnextdocnumber), 
    asyncHandler(multiappointment), 
    asyncHandler(billCtrl.getnextdocnumber), 
    asyncHandler(getmembershipdiscount), 
    asyncHandler(updatebill)
  )

async function findbyId(req, res) {
  let facilitybooking = await facilitybookingCtrl.findbyId(req.params.Id);
  res.json(facilitybooking);
}

async function getmembershipdiscount(req, res, next) {
  req.body.assets = [req.body.facilitybooking];
  let membershipdiscount = await membershipusageCtrl.getmembershipdiscount(req);
  req.body.membershipdiscount = membershipdiscount ? membershipdiscount : 0;
  next()

}

async function updatebill(req, res) {
  var facilitybooking = req.body.facilitybooking;
  req.body.billdate = new Date();
  if (facilitybooking.refid.bookingtype && facilitybooking.refid.bookingtype=="DAILY"){
    req.body.type = "facilitybooking-daily";
  }
  else {
    req.body.type = "facilitybooking";
  }

  req.body.customerid = facilitybooking.customerid._id.toString();
  req.body.onModel = facilitybooking.onModel;
  var assets = [{
    bookingid: facilitybooking._id,
    refid: facilitybooking.refid._id,
    bookingdate: facilitybooking.bookingdate,
    timeslot: facilitybooking.timeslot,
    quantity: facilitybooking.quantity,
    amount: facilitybooking.charges,
    taxes : facilitybooking.refid.taxes,
    discount: facilitybooking.discount,
    cost: facilitybooking.charges,
    status: facilitybooking.status
  }]
  req.body.assets = assets;
  let bill = await billCtrl.insert(req);
  req.body.billid = bill._id
  //facilitybooking = await facilitybookingCtrl.patch(facilitybooking._id, req);
  facilitybooking = await facilitybookingCtrl.findbyIdAndUpdate(facilitybooking._id, req);
  res.json(facilitybooking);
}

async function insert(req, res, next) {
  let facilitybooking = await facilitybookingCtrl.insert(req);
  req.body.facilitybooking = facilitybooking;
  if (req.body.status == "confirmed") next()
  else res.json(facilitybooking);
}

async function update(req, res, next) {
  let facilitybooking = await facilitybookingCtrl.update(req.params.Id, req);
  req.body.facilitybooking = facilitybooking;
  if (req.body.status == "confirmed"  && !facilitybooking.billid) next()
  else res.json(facilitybooking);
}

async function patch(req, res) {
  let facilitybooking = await facilitybookingCtrl.patch(req.params.Id, req);
  res.json(facilitybooking);
}

async function remove(req, res) {
  let facilitybooking = await facilitybookingCtrl.remove(req.params.Id, req);
  res.json(facilitybooking);
}

async function findcount(req, res, next) {
  if (req.body.size){
    if (req.body.webpartid) {
      let ids = await dashboardCtrl.webpartfilter(req);
      req.body.search = [{ "searchfield": "_id", "searchvalue": ids, "datatype": "ObjectId", "criteria": "in" }]
    }
    await facilitybookingCtrl.findcount(req);
    res.header("access-control-expose-headers", "error, totalPages, totalCount");
    res.setHeader("error", req.header.error);
    res.setHeader("totalPages", req.header.totalPages);
    res.setHeader("totalCount", req.header.totalCount);
    next();
  }
  else next()
}

async function filter(req, res, next) {
  if (req.body.webpartid) {
    let ids = await dashboardCtrl.webpartfilter(req);
    req.body.search = [{ "searchfield": "_id", "searchvalue": ids, "datatype": "ObjectId", "criteria": "in" }]
  }
  req.body.formname = req.body.formname? req.body.formname: "facilitybooking";
  let facilitybookings = await facilitybookingCtrl.filter(req.body);
  if (req.body.export) {
    req.body.data = facilitybookings
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = facilitybookings
    next()
  }
  else res.json(facilitybookings);
}

async function multiappointment(req, res , next) {
  let facilitybooking = await facilitybookingCtrl.multiappointment(req);
  facilitybooking.customerid = req.body.attendee;
  req.body.facilitybooking = facilitybooking;
  if (req.body.status == "confirmed") next()
  else res.json(facilitybooking);
}
