const express = require('express');
const asyncHandler = require('express-async-handler');
const packagebookingCtrl = require('../controllers/packagebooking.controller');
const tourpackageCtrl = require('../controllers/tourpackage.controller');
const billCtrl = require('../controllers/bill.controller');
const dashboardCtrl = require('../controllers/dashboard.controller');
const commonCtrl = require('../controllers/common.controller');
const templateCtrl = require('../controllers/template.controller');
const createHTML = require('../helpers/createHTML');
const router = express.Router();
module.exports = router;

router.route('/')
  .post(asyncHandler(packagebookingCtrl.getnextdocnumber),asyncHandler(insert))

router.route('/:Id')
  .put(asyncHandler(update), asyncHandler(updateqty) ,asyncHandler(billCtrl.getnextdocnumber), asyncHandler(updatebill))
  .delete(asyncHandler(remove))
  .get(asyncHandler(findbyId))

router.route('/filter')
  .post(asyncHandler(findcount), asyncHandler(filter), commonCtrl.exportcsv)

router.route('/search/')
  .post(asyncHandler(filter),  commonCtrl.deepobjectsearch_like);

router.route('/generatehtml/:Id')
  .post(asyncHandler(findbytype) ,createHTML.gettourhtml , commonCtrl.getmessagetemplate)

async function findbytype(req, res ,next) {
    let tourpackage, packagebooking;
    var formname = req.body.formname;
    req.body.search = [{ "searchfield": "templatetype", "searchvalue": formname, "datatype": "text", "criteria": "eq" }];
    req.body.formname = 'template'
    var template = await templateCtrl.filter(req.body);
    if(template && template.length > 0)
      req.body.template = template[0];
    if(req.body.type == 'booking'){
      packagebooking = await packagebookingCtrl.findbyId(req.body.id);
      req.body.tourpackage = packagebooking.package;
      req.body.packagebooking = packagebooking;
    }else{
      tourpackage = await tourpackageCtrl.findbyId(req.body.id);
      req.body.tourpackage = tourpackage;
    }
    // res.json(req.body);
    next();
}

async function findbyId(req, res) {
  let packagebooking = await packagebookingCtrl.findbyId(req.params.Id);
  res.json(packagebooking);
}

async function insert(req, res) {
  let packagebooking = await packagebookingCtrl.insert(req);
  res.json(packagebooking);
}

function getbillitems(packagebooking) {

  var billitems = [];
  if (packagebooking.package) {
    var item = { item: packagebooking.itemid, sale: { rate: packagebooking.charges, discount: packagebooking.discount }, quantity: packagebooking.quantity }
    billitems.push(item);
  }
  else if (!packagebooking.package && packagebooking.charges && packagebooking.charges > 0) {
    var item = { item: "6113c9042a6dc02264dc1fbb", sale: { rate: packagebooking.charges, discount: packagebooking.discount }, quantity: packagebooking.quantity }
    billitems.push(item);
  }
  packagebooking.destinations.forEach(destination => {

    var occupants = destination.occupants;
    occupants.forEach(occupant => {
      if (occupant.cost) {
        var item = { item: "60fe3d3112950811a892038e", sale: { rate: occupant.cost, discount: occupant.discount }, quantity: 1 }
        billitems.push(item);
      }
    });

  });

  packagebooking.activity.forEach(activity => {
    if (activity.cost) {
      var item = { item: "60fe3d7912950811a892039b", sale: { rate: activity.cost, discount: activity.discount }, quantity: 1 }
      billitems.push(item);
    }
  })

  packagebooking.transfer.forEach(transfer => {
    if (transfer.cost) {
      var item = { item: "60fe3d3112950811a892038f", sale: { rate: transfer.cost, discount: transfer.discount }, quantity: 1 }
      billitems.push(item);
    }
  })

  packagebooking.flight.forEach(flight => {
    if (flight.cost) {
      var item = { item: "60fe3d7912950811a892039c", sale: { rate: flight.cost, discount: flight.discount }, quantity: 1 }
      billitems.push(item);
    }
  })

  return billitems;

}

async function updatebill(req, res) {
  var packagebooking = req.body.packagebooking;
  var bill = {}
  req.body.billdate = new Date();
  req.body.type = "packagebooking";
  req.body.customerid = packagebooking.customerid._id.toString()
  req.body.onModel = packagebooking.onModel

  req.body.items = getbillitems(packagebooking);
  bill = await billCtrl.insert(req);
  req.body.billid = bill._id
  req.body.packagebooking = await packagebookingCtrl.patch(packagebooking._id, req);
  res.json(req.body.packagebooking);
}

async function updateqty(req, res, next) {
  var packages = req.body.package;
  if(!packages){
    next();
  }else {
    req.body.package = await tourpackageCtrl.patch(packages, req);
    next();
  }
}

async function update(req, res, next) {
  let packagebooking = await packagebookingCtrl.update(req.params.Id, req);
  req.body.packagebooking = packagebooking;
  if (req.body.status == "confirmed") next();
  else res.json(packagebooking);
}

async function remove(req, res) {
  let packagebooking = await packagebookingCtrl.remove(req.params.Id, req);
  res.json(packagebooking);
}

async function findcount(req, res, next) {
  req.body.formname = req.body.formname ? req.body.formname : "packagebooking";
  if (req.body.size) {
    if (req.body.webpartid) {
      let ids = await dashboardCtrl.webpartfilter(req);
      req.body.search = [{ "searchfield": "_id", "searchvalue": ids, "datatype": "ObjectId", "criteria": "in" }]
    }
    await packagebookingCtrl.findcount(req);
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
  req.body.formname = req.body.formname ? req.body.formname : "packagebooking";
  let packagebookings = await packagebookingCtrl.filter(req.body);
  if (req.body.export) {
    req.body.data = packagebookings
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = packagebookings
    next()
  }
  else res.json(packagebookings);
}

