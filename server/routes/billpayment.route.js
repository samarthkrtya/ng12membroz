const express = require('express');
const asyncHandler = require('express-async-handler');
const billpaymentCtrl = require('../controllers/billpayment.controller');
const billCtrl = require('../controllers/bill.controller');
const wallettxnCtrl = require('../controllers/wallettxn.controller');
const dashboardCtrl = require('../controllers/dashboard.controller');
const cashbacktermCtrl = require('../controllers/cashbackterm.controller');
const membershipusageCtrl = require('../controllers/membershipusage.controller');
const commonCtrl = require('../controllers/common.controller');
const router = express.Router();
module.exports = router;
//router.use(passport.authenticate('jwt', { session: false }))

router.route('/')
  .post(asyncHandler(billpaymentCtrl.getnextdocnumber), asyncHandler(insert), asyncHandler(insertwallettxn), asyncHandler(billCtrl.additionalpayment), asyncHandler(cashbacktermCtrl.addcashback))

router.route('/multiple')
  .post(asyncHandler(billpaymentCtrl.getnextdocnumber), asyncHandler(finditembyId), asyncHandler(insertmultiple) , asyncHandler(cashbacktermCtrl.addcashback))
 

router.route('/:Id')
  .put(asyncHandler(update),asyncHandler(billCtrl.updateadditionalpayment))
  .delete(asyncHandler(remove))
  .get(asyncHandler(findbyId))

router.route('/filter')
  .post(asyncHandler(findcount), asyncHandler(filter), commonCtrl.exportcsv)

router.route('/search/')
  .post(asyncHandler(filter),  commonCtrl.deepobjectsearch_like);

async function findbyId(req, res) {
  
  let billpayment = await billpaymentCtrl.findbyId(req.params.Id);
  
  res.json(billpayment);
}

async function finditembyId(req, res, next) {
  var itemsid = req.body.items;
  if (itemsid) {
    let bills = await billCtrl.findbyIds(itemsid);
    req.body.items = bills;
  }
  next();
}

async function insert(req, res, next) {
  let billpayment = await billpaymentCtrl.insert(req);
  if (billpayment.status == "Paid") {
    req.body.bill = billpayment.billid;
    //console.log(req.body.bill);
    await membershipusageCtrl.updateusage(req);
  }
  if (billpayment.paidamount >= 0) {
    req.body.billpayment = billpayment;
    next();
  }
  else
    res.json(billpayment);
}

async function insertmultiple(req, res, next) {
  let billpayments = await billpaymentCtrl.insertmultiple(req);
  // next();
  res.json(billpayments);
}

async function insertwallettxn(req, res, next) {

  var billpayment = req.body.billpayment;
  var items = billpayment.billid.items;
  if (items && items.length > 0) {
    var item = items[0]
    if (item.item._id == "60a2236e48c98c3638e8b2ac"){
      req.body.txnref = "Wallet recharged bill no " + billpayment.docnumber,
      req.body.txntype = "Cr",
      req.body.value = req.body.paidamount,
      req.body.txndate = req.body.paymentdate
      wallettxnCtrl.insert(req).then();
    }
  }
  if (req.body.walletamount && req.body.walletamount > 0) {
    req.body.txnref = "Wallet used for bill " + req.body.bill.docnumber,
    req.body.txntype = "Dr",
    req.body.value = req.body.walletamount,
    req.body.txndate = req.body.paymentdate
    await wallettxnCtrl.insert(req);
  }
  if (billpayment.paidamount > 0) {
    next()
  }
  else res.json(req.body.billpayment);
}

async function update(req, res,next) {
  let billpayment = await billpaymentCtrl.update(req.params.Id, req);
  req.body.billpayment = billpayment;
  next();
  // res.json(billpayment);
}



async function remove(req, res) {
  let billpayment = await billpaymentCtrl.remove(req.params.Id, req);
  res.json(billpayment);
}

async function findcount(req, res, next) {
  if (req.body.size){
    if (req.body.webpartid) {
      let ids = await dashboardCtrl.webpartfilter(req);
      req.body.search = [{ "searchfield": "_id", "searchvalue": ids, "datatype": "ObjectId", "criteria": "in" }]
    }
    await billpaymentCtrl.findcount(req);
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
  req.body.formname = req.body.formname? req.body.formname: "billpayment";
  let billitems = await billpaymentCtrl.filter(req.body);
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
