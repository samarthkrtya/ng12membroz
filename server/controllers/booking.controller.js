const Joi = require('joi');
const Booking = require('../models/booking.model');

const bookingSchema = Joi.object({
  prefix: Joi.string().required(),
  bookingnumber: Joi.number().required(),
  quantity: Joi.number().required(),
  customerid: Joi.string().hex().required(),
  onModel: Joi.string().required(),
  bookingdate: Joi.date().required(),
  checkin: Joi.date().required(),
  checkout: Joi.date().allow(null),
  eventid: Joi.string().hex().allow(null),
  locationid: Joi.string().hex(),
  resortid: Joi.string().hex().allow(null),
  bookingdetail: Joi.object(),
  confirmationdetail: Joi.object(),
  status: Joi.string(),
  property: Joi.object()
})


module.exports = {
  insert,
  update,
  patch,
  remove,
  filter,
  findcount,
  findbyIdAndUpdate,
  findbyId,
  getnextdocnumber,
  exportdata
}

async function findbyId(Id) {
  return await Booking.findById(Id);
}

async function findbyIdAndUpdate(Id, req) {
  return await Booking.findByIdAndUpdate(Id, { billid: req.body.billid }, { new: true })
}

async function insert(req) {
  var body = req.body;
  var property = req.body.property;
  property['confirmationdate'] = property['confirmationdate'] ? new Date(property['confirmationdate']) : '';
  var booking = {
    prefix: body.prefix,
    bookingnumber: body.bookingnumber,
    customerid: body.customerid,
    onModel: body.onModel,
    bookingdate: body.bookingdate,
    checkin: body.checkin,
    checkout: body.checkout,
    locationid: body.locationid,
    eventid: body.eventid && body.eventid._id ? body.eventid._id : null,
    resortid: body.resortid && body.resortid._id ? body.resortid._id : null ,
    bookingdetail: body.bookingdetail,
    confirmationdetail: body.confirmationdetail,
    status: body.status,
    property: body.property
  }
  var quantity = booking.bookingdetail? booking.bookingdetail.totalrooms: 1;
  const diffTime = Math.abs(new Date(booking.checkout) - new Date(booking.checkin));
  const diffDays = Math.ceil(diffTime /86400000);
  booking.quantity = quantity * diffDays;
  await Joi.validate(booking, bookingSchema, { abortEarly: false });
  return await new Booking(booking).save(req);
}

async function update(Id, req) {
  var body = req.body;
  var booking = await Booking.findById(Id);  
  var property = req.body.property;
  property['confirmationdate'] = property['confirmationdate'] ? new Date(property['confirmationdate']) : '';
  booking._original = booking.toObject();
  booking.customerid = body.customerid,
    booking.onModel = body.onModel,
    booking.bookingdate = body.bookingdate,
    booking.checkin = body.checkin,
    booking.checkout = body.checkout,
    booking.locationid = body.locationid,
    booking.eventid = body.eventid,
    booking.resortid = body.resortid && body.resortid._id ? body.resortid._id : null,
    booking.bookingdetail = body.bookingdetail,
    booking.confirmationdetail = body.confirmationdetail,
    booking.charges = body.charges,
    booking.property = body.property,
    booking.status = body.status

  var quantity = booking.bookingdetail ? booking.bookingdetail.totalrooms : 1;
  const diffTime = Math.abs(new Date(booking.checkout) - new Date(booking.checkin));
  const diffDays = Math.ceil(diffTime / 86400000);
  booking.quantity = quantity * diffDays;
  return await booking.save(req);
}


async function patch(Id, req) {
  var body = req.body;
  var booking = await Booking.findById(Id);
  booking._original = booking.toObject();
  if (req.body.status) booking.status = body.status
  if (req.body.billid) booking.billid = body.billid
  return await booking.save(req);
}


async function remove(Id, req) {
  var booking = await Booking.findById(Id);
  booking.status = "deleted"
  return await booking.save(req);
}

async function filter(params) {
  return await Booking.getbyfilter(params)
}

async function getnextdocnumber(req, res, next) {

  var branch = req.body.authkey.branchid;
  var prefix = "";

  if (DATABASETYPE == "branchwise") {
    var docformat = branch.docformat;
    prefix = docformat.booking ? docformat.booking["prefix"] : "HB";
  } else {
    var docformat = BILLFORMAT;
    if (docformat)
      prefix = docformat.booking ? docformat.booking["prefix"] : "HB";
  }

  Booking.getnextdocnumber(prefix, branch._id)
    .then((bookingnumber) => {
      req.body.bookingnumber = bookingnumber;
      req.body.prefix = prefix;
      if (!req.body.customerid) return res.json(prefix + "-" + bookingnumber);
      else next();
    })
    .catch((e) => next1(e));

}

async function findcount(req) {
  return await Booking.findcount(req)
}

async function exportdata(params) {
  return await Booking.exportdata(params)
}

