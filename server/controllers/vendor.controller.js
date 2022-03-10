const Joi = require('joi');
const Vendor = require('../models/vendor.model');
const Vendorview = require('../views/vendor.view');
const Activityview = require('../views/activity.view');
const Communicationlogview = require('../views/communicationlog.view');
const Timelineview = require('../views/timeline.view');

const vendorSchema = Joi.object({
  fullname: Joi.string().required(),
  profilepic: Joi.string(),
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
  viewfilter,
  timelinefilterview,
  acivityfilterview,
  communicationfilterview
}


async function patch(Id, req) {
  var vendor = await Vendor.findById(Id);
  vendor._original = vendor.toObject();
  if (req.body.profilepic) vendor.profilepic = req.body.profilepic;
  return await vendor.save(req);

}


async function findbyId(Id) {
  return await Vendor.findById(Id);
}

async function viewfilter(params) {
  return await Vendorview.getfilterview(params)
}

async function acivityfilterview(params) {
  return await Activityview.getfilterview(params)
}

async function communicationfilterview(params) {
  return await Communicationlogview.getfilterview(params)
}

async function timelinefilterview(params) {
  return await Timelineview.getfilterview(params)
}

async function insert(req) {
  var vendor = {
    fullname: req.body.fullname,
    property: req.body.property,
  }
  vendor = await Joi.validate(vendor, vendorSchema, { abortEarly: false });
  return await new Vendor(vendor).save(req);
}

async function update(Id, req) {
  var vendor = await Vendor.findById(Id);
  vendor._original = vendor.toObject();
  vendor.fullname = req.body.fullname,
    vendor.property = req.body.property
  return await vendor.save(req);
}

async function remove(Id, req) {
  var vendor = await Vendor.findById(Id);
  vendor.status = "deleted"
  return await vendor.save(req);
}

async function filter(params) {
  return await Vendor.getbyfilter(params)
}

async function findcount(req) {
  return await Vendor.findcount(req)
}

async function exportdata(params) {
  return await Vendor.exportdata(params)
}
