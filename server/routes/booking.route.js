const express = require('express');
const asyncHandler = require('express-async-handler');
const bookingCtrl = require('../controllers/booking.controller');
const billCtrl = require('../controllers/bill.controller');
const dashboardCtrl = require('../controllers/dashboard.controller');
const membershipusageCtrl = require('../controllers/membershipusage.controller');
const commonCtrl = require('../controllers/common.controller');
const router = express.Router();
const common = require('../helpers/common');

module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))

router.route('/')
  .post(asyncHandler(bookingCtrl.getnextdocnumber), asyncHandler(insert), asyncHandler(billCtrl.getnextdocnumber), asyncHandler(getmembershipdiscount), asyncHandler(updatebill))

router.route('/:Id')
  .put(asyncHandler(update), asyncHandler(billCtrl.getnextdocnumber), asyncHandler(getmembershipdiscount), asyncHandler(updatebill))
  .patch(asyncHandler(patch))
  .delete(asyncHandler(remove))
  .get(asyncHandler(findbyId))

router.route('/filter')
  .post(asyncHandler(findcount), asyncHandler(filter), commonCtrl.exportcsv)

router.route('/search/')
  .post(asyncHandler(filter), commonCtrl.deepobjectsearch_like);

async function getmembershipdiscount(req, res, next) {

  let membershipdiscount = await membershipusageCtrl.getmembershipdiscount(req);
  req.body.membershipdiscount = membershipdiscount ? membershipdiscount : 0;
  next()

}

async function updatebill(req, res) {
  var booking = req.body.booking;
  var bill = {}
  req.body.billdate = new Date();
  req.body.type = "booking";
  req.body.customerid = booking.customerid._id.toString()
  req.body.onModel = booking.onModel

  var billitems = []
  billitems = booking.bookingdetail.occupants;

  var items = []
  billitems.forEach(billitem => {
    if (billitem.itemid){
      var item = { item: billitem.itemid, sale: { rate: billitem.cost, discount: billitem.discount }, quantity: billitem.quantity  }
      items.push(item)
    }

  });
  req.body.items = items;
  bill = await billCtrl.insert(req);
  req.body.billid = bill._id
  req.body.booking = await bookingCtrl.findbyIdAndUpdate(booking._id, req);
  res.json(req.body.booking);
}

async function findbyId(req, res) {
  let booking = await bookingCtrl.findbyId(req.params.Id);
  res.json(booking);
}

async function insert(req, res, next) {
  let booking = await bookingCtrl.insert(req);
  req.body.booking = booking;
  if (req.body.status == "confirmed") next()
  else res.json(booking);
}

async function update(req, res, next) {
  let booking = await bookingCtrl.update(req.params.Id, req);
  req.body.booking = booking;
  if (req.body.status == "confirmed") next()
  else res.json(booking);
}

async function patch(req, res) {
  let booking = await bookingCtrl.patch(req.params.Id, req);
  res.json(booking);
}

async function remove(req, res) {
  let booking = await bookingCtrl.remove(req.params.Id, req);
  res.json(booking);
}

async function findcount(req, res, next) {
  if (req.body.size) {
    if (req.body.webpartid) {
      let ids = await dashboardCtrl.webpartfilter(req);
      req.body.search = [{ "searchfield": "_id", "searchvalue": ids, "datatype": "ObjectId", "criteria": "in" }]
    }
    await bookingCtrl.findcount(req);
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
  req.body.formname = req.body.formname ? req.body.formname : "booking";
  let bookings = await bookingCtrl.filter(req.body);
  if (req.body.export) {
    req.body.data = bookings
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)) {
    req.body.data = bookings
    next()
  }
  else res.json(bookings);
}
