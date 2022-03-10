const Joi = require('joi');
const Asset = require('../models/asset.model');
const Assetview = require('../views/asset.view');
const Vehicleview = require('../views/vehicle.view');

const assetSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().allow(null),
  quantity: Joi.number(),
  unitdetail: Joi.array(),
  category: Joi.string().hex(),
  duration: Joi.number().allow(null),
  customerid: Joi.string().hex(),
  onCustomerModel: Joi.string(),
  charges: Joi.number(),
  profilepic: Joi.string(),
  advancecharges: Joi.array(),
  bookingtype: Joi.string(),
  availability: Joi.object(),
  advanceavailability: Joi.array(),
  breaktime: Joi.array(),
  taxes: Joi.array().allow(null),
  gallery: Joi.array(),
  property: Joi.object(),
})


module.exports = {
  insert,
  update,
  patch,
  remove,
  filter,
  filterview,
  vehiclefilterview,
  findcount,
  findbyId,
  exportdata
}

async function findbyId(Id) {
  return await Asset.findById(Id);
}

async function patch(Id, req) {

  var asset = await Asset.findById(Id);
  asset._original = asset.toObject();

  if (req.body.property) asset.property = req.body.property;
  if (req.body.status) asset.status = req.body.status;
  if (req.body.profilepic) asset.profilepic = req.body.profilepic;
  if (req.body.availability) asset.availability = req.body.availability;
  if (req.body.breaktime) asset.breaktime = req.body.breaktime;
  if (req.body.duration) asset.duration = req.body.duration;

  return await asset.save(req);
}

async function insert(req) {

  if (req.body.profilepic && Array.isArray(req.body.profilepic)){
    req.body.profilepic = req.body.profilepic[0] ? req.body.profilepic[0].attachment : null
  }

  var asset = {
    title: req.body.title,
    description: req.body.description,
    category: req.body.category,
    quantity: req.body.quantity,
    unitdetail: req.body.unitdetail,
    duration: req.body.duration,
    charges: req.body.charges,
    taxes: req.body.taxes,
    customerid: req.body.customerid,
    onCustomerModel: req.body.onCustomerModel,
    advancecharges: req.body.advancecharges,
    bookingtype: req.body.bookingtype,
    availability: req.body.availability,
    advanceavailability: req.body.advanceavailability,
    breaktime: req.body.breaktime,
    gallery: req.body.gallery,
    property: req.body.property,
    profilepic: req.body.profilepic,
  }
  await Joi.validate(asset, assetSchema, { abortEarly: false });
  return await new Asset(asset).save(req);
}

async function update(Id, req) {

  if (req.body.profilepic && Array.isArray(req.body.profilepic)){
    req.body.profilepic = req.body.profilepic[0] ? req.body.profilepic[0].attachment : null
  }

  var body = req.body;
  var asset = await Asset.findById(Id);
  asset._original = asset.toObject();
  asset.title = body.title,
  asset.description = body.description,
  asset.quantity = body.quantity,
  asset.unitdetail = body.unitdetail,
  asset.category = body.category,
  asset.duration = body.duration,
  asset.charges = body.charges,
  asset.customerid = body.customerid,
  asset.onCustomerModel = body.onCustomerModel,
  asset.taxes = body.taxes,
  asset.advancecharges = body.advancecharges,
  asset.bookingtype = body.bookingtype,
  asset.availability = body.availability,
  asset.advanceavailability = body.advanceavailability,
  asset.breaktime = body.breaktime,
  asset.gallery = body.gallery,
  asset.property = body.property
  return await asset.save(req);
}

async function remove(Id, req) {
  var asset = await Asset.findById(Id);
  asset.status = "deleted"
  return await asset.save(req);
}

async function filter(params) {
  return await Asset.getbyfilter(params)
}

async function filterview(params) {
  return await Assetview.getbyfilter(params)
}

async function vehiclefilterview(params) {
  return await Vehicleview.getfilterview(params)
}

async function findcount(req) {
  return await Asset.findcount(req)
}

async function exportdata(params) {
  return await Asset.exportdata(params)
}
