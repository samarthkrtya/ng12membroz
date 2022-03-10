const Joi = require('joi');
const { consoleTestResultHandler } = require('tslint/lib/test');
const Tourpackage = require('../models/tourpackage.model');

const tourpackageSchema = Joi.object({
  title: Joi.string().required(),
  packagetype: Joi.string().required(),
  duration: Joi.string().required(),
  cost: Joi.number().required(),
  image: Joi.object().allow(null),
  totaladults: Joi.number().required(),
  totalchildrens: Joi.number().allow(null),
  basetourpackage: Joi.string().hex().allow(null),
  traveldate: Joi.date().allow(null),
  capacity: Joi.number(),
  schedule: Joi.string().allow(null),
  itemid: Joi.string(),
  bookedcapacity: Joi.number(),
  taxes : Joi.array(),
  destinations: Joi.array(),
  activity: Joi.array(),
  transfer: Joi.array(),
  flight: Joi.array(),
  property: Joi.object(),
  status: Joi.string().allow(null)
})


module.exports = {
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
  return await Tourpackage.findById(Id);
}

async function insert(req) {
  if (Array.isArray(req.body.traveldate)) {
    var dates = req.body.traveldate;
    var tourpackages = [];
    for (const element of dates) {
      var tourpackage = {
        title: req.body.title,
        packagetype: req.body.packagetype,
        basetourpackage: req.body.basetourpackage,
        duration: req.body.duration,
        cost: req.body.cost,
        schedule: req.body.schedule,
        itemid: req.body.itemid,
        image: req.body.image,
        totaladults: req.body.totaladults,
        totalchildrens: req.body.totalchildrens,
        taxes: req.body.taxes,
        traveldate: element,
        capacity: req.body.capacity,
        destinations: req.body.destinations,
        activity: req.body.activity,
        transfer: req.body.transfer,
        flight: req.body.flight,
        property: req.body.property,
        status: req.body.status,
      }
      tourpackage = await Joi.validate(tourpackage, tourpackageSchema, { abortEarly: false });
      tourpackage = await new Tourpackage(tourpackage).save(req);
      tourpackages.push(tourpackage);
    }
    return tourpackages;
  } else {
    var tourpackage = {
      title: req.body.title,
      packagetype: req.body.packagetype,
      basetourpackage: req.body.basetourpackage,
      duration: req.body.duration,
      cost: req.body.cost,
      schedule: req.body.schedule,
      itemid: req.body.itemid,
      image: req.body.image,
      totaladults: req.body.totaladults,
      totalchildrens: req.body.totalchildrens,
      taxes: req.body.taxes,
      traveldate: req.body.traveldate,
      capacity: req.body.capacity,
      destinations: req.body.destinations,
      activity: req.body.activity,
      transfer: req.body.transfer,
      flight: req.body.flight,
      property: req.body.property,
      status: req.body.status,
    }
    tourpackage = await Joi.validate(tourpackage, tourpackageSchema, { abortEarly: false });
    return await new Tourpackage(tourpackage).save(req);
  }
}

async function update(Id, req) {
  var body = req.body;
  var tourpackage = await Tourpackage.findById(Id);
  tourpackage._original = tourpackage.toObject();
  tourpackage.title = body.title,
  tourpackage.packagetype = body.packagetype,
  tourpackage.basetourpackage = body.basetourpackage,
  tourpackage.duration = body.duration,
  tourpackage.cost = body.cost,
  tourpackage.schedule = body.schedule,
  tourpackage.image = body.image,
  tourpackage.totaladults = body.totaladults,
  tourpackage.totalchildrens = body.totalchildrens,
  tourpackage.taxes = body.taxes,
  tourpackage.traveldate = body.traveldate,
  tourpackage.capacity = body.capacity,
  tourpackage.destinations = body.destinations,
  tourpackage.activity = body.activity,
  tourpackage.transfer = body.transfer,
  tourpackage.flight = body.flight,
  tourpackage.property= body.property
  return await tourpackage.save(req);
}


async function patch(Id, req) {
  var body = req.body;
  var tourpackage = await Tourpackage.findById(Id);
  tourpackage._original = tourpackage.toObject();
  if (req.body.bookedcapacity) tourpackage.bookedcapacity = body.bookedcapacity;
  if (req.body.capacity) tourpackage.capacity = body.capacity;
  if (req.body.schedule) tourpackage.schedule = body.schedule;
  return await tourpackage.save(req);
}


async function remove(Id, req) {
  var tourpackage = await Tourpackage.findById(Id);
  tourpackage.status = "deleted"
  return await tourpackage.save(req);
}

async function filter(params) {
  return await Tourpackage.getbyfilter(params)
}

async function findcount(req) {
  return await Tourpackage.findcount(req)
}

async function exportdata(params) {
  return await Tourpackage.exportdata(params)
}
