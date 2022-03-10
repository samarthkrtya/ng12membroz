const express = require('express');
const asyncHandler = require('express-async-handler');
const billCtrl = require('../controllers/bill.controller');
const inventoryCtrl = require('../controllers/inventory.controller');
const membershipusageCtrl = require('../controllers/membershipusage.controller');
const commonCtrl = require('../controllers/common.controller');
const appointmentCtrl = require('../controllers/appointment.controller');
const facilitybookingCtrl = require('../controllers/facilitybooking.controller');
const templateCtrl = require('../controllers/template.controller');
const dashboardCtrl = require('../controllers/dashboard.controller');
const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))

router.route('/')
  .post(asyncHandler(billCtrl.getnextdocnumber), asyncHandler(getmembershipdiscount), asyncHandler(insert), asyncHandler(updateappointments), asyncHandler(updatefacilitybooking), asyncHandler(updateinventoryandusage))

router.route('/insertmultiple')
  .post(asyncHandler(billCtrl.getnextdocnumber), asyncHandler(asyncHandler(insertmultple)))

router.route('/:Id')
  .put(asyncHandler(getmembershipdiscount), asyncHandler(update), asyncHandler(updateappointments), asyncHandler(updatefacilitybooking), asyncHandler(updateinventoryandusage))
  .delete(asyncHandler(remove))
  .get(asyncHandler(findbyId))

router.route('/void/:Id')
  .put(asyncHandler(voidorder))

router.route('/filter')
  .post(asyncHandler(findcount), asyncHandler(filter), commonCtrl.exportcsv)

router.route('/search/')
  .post(asyncHandler(filter),  commonCtrl.deepobjectsearch_like);

router.route('/outstanding/:id/:billid')
  .get(asyncHandler(getOAU));

router.route('/outstanding/:id')
  .get(asyncHandler(getOAU));

router.route('/billdetail/')
  .post(asyncHandler(getbilldetail));

router.route('/findvalidgc/')
  .post(asyncHandler(findvalidgc));

router.route('/razorpay/subscription')
.post(asyncHandler(createsubcription));


async function findbyId(req, res) {
  let bill = await billCtrl.findbyId(req.params.Id);
  res.json(bill);
}


async function updateappointments(req, res, next) {
  if (!req.body.bill.services) next();
  else {
   // req.body.status = "confirmed";
    appointmentCtrl.updateappointments(req, res, next)
    next()
  }
}

async function updatefacilitybooking(req, res, next) {
  if (!req.body.bill.assets) next();
  else {
 //   req.body.status = "confirmed";
    facilitybookingCtrl.updatefacilitybooking(req, res, next)
    next()
  }
}

async function insert(req, res, next) {
  let bill = await billCtrl.insert(req);
  req.body.bill = bill;
  next();
}


async function insertmultple(req, res, next) {
  await billCtrl.insertmultple(req);
  res.json('success');
}

async function getOAU(req, res, next) {
  var customerid = req.params.id;
  var billid = req.params.billid;
  let bill;
  if (billid){
    bill = await billCtrl.findbyId(billid);
  }
  let outstanding = await billCtrl.getOAU(bill, customerid);
  res.json(outstanding);
}

async function findvalidgc(req, res) {
  let bill = await billCtrl.findvalidgc(req, res);
  // console.log("bill",bill);
  res.json(bill);
}

async function getmembershipdiscount(req, res, next) {

  let membershipdiscount = await membershipusageCtrl.getmembershipdiscount(req);
  req.body.membershipdiscount = membershipdiscount ? membershipdiscount : 0;
  next()

}

async function getbilldetail(req, res, next) {

  let membershipdiscount = await membershipusageCtrl.getmembershipdiscount(req);
  let billdetail = await billCtrl.getbilldetail(req, membershipdiscount);

  billdetail = { discount: billdetail.discount, taxamount: billdetail.taxamount, membershipdiscount: billdetail.membershipdiscount, billamount: billdetail.billamount, grandtotal: billdetail.grandtotal, taxdetail: billdetail.taxdetail }
  res.json(billdetail);
}

async function update(req, res, next) {
  let bill = await billCtrl.update(req.params.Id, req);
  req.body.bill = bill;
  next();
}

async function updateinventoryandusage(req, res) {
  let bill = await inventoryCtrl.updateinventory(req.body);
  if (bill.status == "Paid") {
    let packagediscount = await membershipusageCtrl.updateusage(req);
    bill.property = { packagediscount: packagediscount };
  }
  res.json(bill);
}

async function remove(req, res) {
  let bill = await billCtrl.remove(req.params.Id, req);
  res.json(bill);
}

async function voidorder(req, res ,next) {
  const bill =  await billCtrl.voidorder(req.params.Id, req);
  res.json(bill);
}

async function findcount(req, res, next) {
  if (req.body.size){
    if (req.body.webpartid) {
      let ids = await dashboardCtrl.webpartfilter(req);
      req.body.search = [{ "searchfield": "_id", "searchvalue": ids, "datatype": "ObjectId", "criteria": "in" }]
    }
    await billCtrl.findcount(req);
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
  req.body.formname = req.body.formname? req.body.formname: "bill";
  let billitems = await billCtrl.filter(req.body);
  if (req.body.export) {
    req.body.data = billitems
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = billitems
    next()
  }
  else res.json(billitems);
}

async function createsubcription(req, res, next) {
  let subscription = await commonCtrl.createrazorpaysubscription(req, res);
  res.json(subscription);
}
