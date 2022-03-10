const Joi = require('joi');
const Facilitybooking = require('../models/facilitybooking.model');

const facilitybookingSchema = Joi.object({
  prefix: Joi.string(),
  bookingnumber: Joi.number().required(),
  customerid: Joi.string().hex().required(),
  onModel: Joi.string().required(),
  bookingdate: Joi.date().required(),
  checkin: Joi.date(),
  checkout: Joi.date(),
  refid: Joi.string().hex().required(),
  timeslot: Joi.object(),
  charges: Joi.number(),
  quantity: Joi.number(),
  status: Joi.string(),
  bookingdetail: Joi.object(),
  property: Joi.object()
})


module.exports = {
  insert,
  update,
  patch,
  remove,
  filter,
  findcount,
  findbyId,
  exportdata,
  getnextdocnumber,
  updatefacilitybooking,
  findbyIdAndUpdate,
  multiappointment
}

async function findbyIdAndUpdate(Id, req) {
  return await Facilitybooking.findByIdAndUpdate(Id, { billid: req.body.billid }, { new: true })
}

async function findbyId(Id) {
  return await Facilitybooking.findById(Id);
}

async function getnextdocnumber(req, res, next) {

  var branch = req.body.authkey.branchid;
  var prefix = "";

  if (DATABASETYPE == "branchwise") {
    var docformat = branch.docformat;
    prefix = docformat.facility ? docformat.facility["prefix"] : "FB";
  } else {
    var docformat = BILLFORMAT;
    if (docformat)
      prefix = docformat.facility ? docformat.facility["prefix"] : "FB";
  }

  Facilitybooking.getnextdocnumber(prefix, branch._id)
    .then((bookingnumber) => {
      req.body.bookingnumber = bookingnumber;
      req.body.prefix = prefix;
      if (!req.body.refid) return res.json(prefix + "-" + bookingnumber);
      else next();
    })

}

function updatefacilitybooking(req, res, next) {
  var bill = req.body.bill;
  var status  = req.body.status;

  for (var i = 0; i < bill.assets.length; i++) {
    if (!status) status = bill.assets[i].status;
    Facilitybooking.findByIdAndUpdate(bill.assets[i].bookingid, { "$set": { billid: bill._id, status: status } }).then()
  }

}

async function insert(req) {
  var body = req.body;
  var facilitybooking = {
    prefix: body.prefix,
    bookingnumber: body.bookingnumber,
    customerid: body.customerid,
    onModel: body.onModel,
    bookingdate: body.bookingdate,
    checkin: body.checkin,
    checkout: body.checkout,
    refid: body.refid,
    timeslot: body.timeslot ? body.timeslot : {},
    charges: body.charges,
    bookingdetail: body.bookingdetail,
    status: body.status,
    property: body.property
  }
  if (req.body.bookingdetail && req.body.bookingdetail.occupants.length > 0)
  {
    var Difference_In_Time = (new Date(facilitybooking.checkout)).getTime() - (new Date(facilitybooking.checkin)).getTime();
    var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
    facilitybooking.bookingdetail.totalrooms = req.body.bookingdetail.occupants.length;
    facilitybooking.quantity = req.body.bookingdetail.occupants.length * Difference_In_Days;
  }
  //facilitybooking.quantity =

  await Joi.validate(facilitybooking, facilitybookingSchema, { abortEarly: false });
  return await new Facilitybooking(facilitybooking).save(req);
}

async function update(Id, req) {
  var body = req.body;
  var facilitybooking = await Facilitybooking.findById(Id);
  facilitybooking._original = facilitybooking.toObject();
  facilitybooking.customerid = body.customerid,
    facilitybooking.onModel = body.onModel,
    facilitybooking.bookingdate = body.bookingdate,
    facilitybooking.checkin = body.checkin,
    facilitybooking.checkout = body.checkout,
    facilitybooking.refid = body.refid,
    facilitybooking.timeslot = body.timeslot ? body.timeslot : {},
    facilitybooking.charges = body.charges,
    facilitybooking.bookingdetail = body.bookingdetail,
    facilitybooking.status = body.status,
    facilitybooking.property = body.property
  if (req.body.totalrooms && req.body.totalrooms > 0) {
    var Difference_In_Time = (new Date(facilitybooking.checkout)).getTime() - (new Date(facilitybooking.checkin)).getTime();
    var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
    facilitybooking.bookingdetail.totalrooms = req.body.bookingdetail.occupants.length;
    facilitybooking.quantity = Difference_In_Days * req.body.totalrooms;
  }
  return await facilitybooking.save(req);

}

async function patch(Id, req) {
  var facilitybooking = await Facilitybooking.findById(Id);
  facilitybooking._original = facilitybooking.toObject();
  if (req.body.billid) facilitybooking.billid = req.body.billid;
  if (req.body.status) facilitybooking.status = req.body.status;
  return await facilitybooking.save(req);
}

async function remove(Id, req) {
  var facilitybooking = await Facilitybooking.findById(Id);
  facilitybooking.status = "deleted"
  return await facilitybooking.save(req);
}

async function filter(params) {
  return await Facilitybooking.getbyfilter(params)
}

async function findcount(req) {
  return await Facilitybooking.findcount(req)
}

async function exportdata(params) {
  return await Facilitybooking.exportdata(params)
}

async function multiappointment(req) {

  var body = req.body;

  if (Array.isArray(body.services)) {

      var services = body.services;
      var number = body.bookingnumber;

      var facilitybookings = [];
      for (const element of services) {

        var facilitybooking = {
          bookingnumber: number,
          prefix: body.prefix,
          customerid: body.attendee,
          onModel: body.onModel,
          bookingdate: element.date,
          checkin: body.checkin,
          checkout: body.checkout,
          refid: element.refid && element.refid._id ? element.refid._id : element.refid,
          timeslot: element.timeslot,
          charges: element.charges,
          bookingdetail: body.bookingdetail,
          status: body.status,
          property: element.property,
        }

        number += 1;

        var facilitybooking = await Joi.validate(facilitybooking, facilitybookingSchema, { abortEarly: false });
        facilitybooking = await new Facilitybooking(facilitybooking).save(req);
        facilitybookings.push(facilitybooking);
      }

      return facilitybookings;

  }
  
}

