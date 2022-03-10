// const bcrypt = require('bcrypt');
const Joi = require('joi');
const Availabilitycalendar = require('../models/availabilitycalendar.model');
const common = require('../helpers/common');
var ObjectID = require('mongodb').ObjectID;

const availabilitycalendarSchema = Joi.object({
  refid: Joi.string().hex().required(),
  onModel: Joi.string().required(),
  startdate: Joi.date().required(),
  enddate: Joi.date().required(),
  quantity: Joi.number().allow(null),
  availability: Joi.array().required(),
  breaktime: Joi.array(),
  property: Joi.object()
})

module.exports = {
  insert,
  update,
  remove,
  filter,
  findcount,
  findbyId,
  exportdata,
  massupdate,
  usermassupdate
}

async function findbyId(Id) {
  return await Availabilitycalendar.findById(Id);
}

async function insert(req) {
  
  var availabilitycalendar = {
    refid: req.body.refid,
    onModel: req.body.onModel,
    startdate: req.body.startdate,
    enddate: req.body.enddate,
    availability: req.body.availability,
    quantity: req.body.quantity,
    property: req.body.property
  }
  availabilitycalendar = await Joi.validate(availabilitycalendar, availabilitycalendarSchema, { abortEarly: false });
  return await new Availabilitycalendar(availabilitycalendar).save(req);
}

async function update(Id, req) {
  var availabilitycalendar = await Availabilitycalendar.findById(Id);
  availabilitycalendar._original = availabilitycalendar.toObject();
  availabilitycalendar.refid = req.body.refid,
  availabilitycalendar.onModel = req.body.onModel,
  availabilitycalendar.startdate = req.body.startdate,
  availabilitycalendar.enddate = req.body.enddate,
  availabilitycalendar.availability = req.body.availability,
  availabilitycalendar.quantity = req.body.quantity,
  availabilitycalendar.property = req.body.property
  return await availabilitycalendar.save(req);
}

async function remove(Id, req) {
  var availabilitycalendar = await Availabilitycalendar.findById(Id);
  availabilitycalendar.status = "deleted"
  return await availabilitycalendar.save(req);
}

async function filter(params) {
  return await Availabilitycalendar.getbyfilter(params)
}

async function findcount(req) {
  return await Availabilitycalendar.findcount(req)
}

async function exportdata(params) {
  return await Availabilitycalendar.exportdata(params)
}

async function massupdate(req) {
  var params = req.body
  if(params && params.data && params.data.length > 0) {
    params.data.forEach(async (element) => {
      if(element._id) {
        element.startdate= common.convertolocaltime(req.body, element.startdate),
        element.enddate= common.convertolocaltime(req.body, element.enddate),
        Availabilitycalendar.findOneAndUpdate({ _id: element._id }, element, {new: true, upsert: true}).then().catch((e) => console.log(e))
      } else {
        var availabilitycalendar = {
          refid: element.refid,
          onModel: element.onModel,
          startdate: common.convertolocaltime(req.body, element.startdate),
          enddate: common.convertolocaltime(req.body, element.enddate),
          availability: element.availability,
          quantity: element.quantity,
        }
        availabilitycalendar = await Joi.validate(availabilitycalendar, availabilitycalendarSchema, { abortEarly: false });
        new Availabilitycalendar(availabilitycalendar).save(req)
      }
    });
  }
  return {}
}

async function usermassupdate(req) {

  var params = req.body  
  if(params && params.data && params.data.length > 0) {
    params.data.forEach(async (element) => {      
      if(element._id) {
        element.startdate= common.convertolocaltime(req.body, element.startdate),
        element.enddate= common.convertolocaltime(req.body, element.enddate),
        Availabilitycalendar.findOneAndUpdate({ _id: element._id }, element, {new: true, upsert: true}).then().catch((e) => console.log(e))
      } else {
        var availabilitycalendar = {
          refid: element.refid,
          onModel: element.onModel,
          startdate: common.convertolocaltime(req.body, element.startdate),
          enddate: common.convertolocaltime(req.body, element.enddate),
          availability: element.availability,
          breaktime: element.breaktime,
          quantity: element.quantity,
        }
        availabilitycalendar = await Joi.validate(availabilitycalendar, availabilitycalendarSchema, { abortEarly: false });
        new Availabilitycalendar(availabilitycalendar).save(req)
      }
    });
  }
  return {}
}

