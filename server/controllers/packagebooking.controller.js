const Joi = require('joi');
const Packagebooking = require('../models/packagebooking.model');

const tourpackageSchema = Joi.object({
  prefix: Joi.string().required(),
  tournumber: Joi.number().required(),
  customerid: Joi.string().hex().required(),
  itemid: Joi.string().hex().allow(null),
  onModel: Joi.string().required(),
  bookingdate: Joi.date().required(),
  traveldate: Joi.date().required(),
  charges: Joi.number(),
  quantity: Joi.number(),
  totaladults: Joi.number().required(),
  totalchildrens: Joi.number().allow(null),
  package: Joi.string().allow(null),
  destinations: Joi.array(),
  activity: Joi.array(),
  transfer: Joi.array(),
  flight: Joi.array(),
  billid: Joi.string(),
  status: Joi.string(),
  property: Joi.object()
})


module.exports = {
  getnextdocnumber,
  insert,
  update,
  patch,
  remove,
  filter,
  findcount,
  findbyId,
  exportdata
}

async function findbyId(Id) {
  return await Packagebooking.findById(Id);
}


async function getnextdocnumber(req, res, next) {

  var branch = req.body.authkey.branchid;
  var prefix = "";

  if (DATABASETYPE == "branchwise") {
    var docformat = branch.docformat;
    prefix = docformat.booking ? docformat.booking["prefix"] : "TB";
  } else {
    var docformat = BILLFORMAT;
    if (docformat)
      prefix = docformat.booking ? docformat.booking["prefix"] : "TB";
  }

  Packagebooking.getnextdocnumber(prefix, branch._id)
    .then((tournumber) => {
      req.body.tournumber = tournumber;
      req.body.prefix = prefix;
      if (!req.body.customerid) return res.json(prefix + "-" + tournumber);
      else next();
    })
}

async function insert(req) {
  var packagebooking = {
    prefix: req.body.prefix,
    tournumber: req.body.tournumber,
    customerid: req.body.customerid,
    onModel: req.body.onModel,
    bookingdate: req.body.bookingdate,
    traveldate: req.body.traveldate,
    package: req.body.package,
    charges: req.body.charges,
    quantity: req.body.quantity,
    itemid: req.body.itemid,
    totaladults: req.body.totaladults,
    totalchildrens: req.body.totalchildrens,
    destinations: req.body.destinations,
    activity: req.body.activity,
    transfer: req.body.transfer,
    flight: req.body.flight,
    status: req.body.status,
    property: req.body.property,
  }
  packagebooking = await Joi.validate(packagebooking, tourpackageSchema, { abortEarly: false });
  return await new Packagebooking(packagebooking).save(req);
}

async function update(Id, req) {
  var body = req.body;
  var packagebooking = await Packagebooking.findById(Id);
  packagebooking._original = packagebooking.toObject();
  packagebooking.customerid = req.body.customerid,
  packagebooking.onModel = req.body.onModel,
  packagebooking.bookingdate = req.body.bookingdate,
  packagebooking.traveldate = req.body.traveldate,
  packagebooking.itemid = req.body.itemid,
  packagebooking.package = req.body.package,
  packagebooking.charges = req.body.charges,
  packagebooking.quantity = req.body.quantity,
  packagebooking.totaladults = body.totaladults,
  packagebooking.totalchildrens = body.totalchildrens,
  packagebooking.destinations = body.destinations,
  packagebooking.activity = body.activity,
  packagebooking.transfer = body.transfer,
  packagebooking.flight = body.flight,
  packagebooking.status = body.status,
  packagebooking.property= body.property
  return await packagebooking.save(req);
}

async function patch(Id, req) {
  var body = req.body;
  var packagebooking = await Packagebooking.findById(Id);
  packagebooking._original = packagebooking.toObject();
  if (req.body.billid) packagebooking.billid = body.billid;
  return await packagebooking.save(req);
}



async function remove(Id, req) {
  var packagebooking = await Packagebooking.findById(Id);
  packagebooking.status = "deleted"
  return await packagebooking.save(req);
}

async function filter(params) {
  return await Packagebooking.getbyfilter(params)
}

async function findcount(req) {
  return await Packagebooking.findcount(req)
}

async function exportdata(params) {
  return await Packagebooking.exportdata(params)
}
