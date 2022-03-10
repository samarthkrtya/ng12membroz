// const bcrypt = require('bcrypt');
const Joi = require('joi');
const Advanceclaim = require('../models/advanceclaim.model');
const advanceclaimSchema = Joi.object({
  userid: Joi.string().hex().required(),
  title: Joi.string().required(),
  property: Joi.object()
})


module.exports = {
  insert,
  update,
  remove,
  filter,
  findcount,
  findbyId,
  exportdata
}

async function findbyId(Id) {
  return await Advanceclaim.findById(Id);
}

async function insert(req) {
  var advanceclaim = {
    userid: req.body.userid ? req.body.userid.toString() : req.body.authkey._id.toString(),
    title: req.body.title,
    property: req.body.property
  }
  advanceclaim = await Joi.validate(advanceclaim, advanceclaimSchema, { abortEarly: false });
  return await new Advanceclaim(advanceclaim).save(req);
}

async function update(Id, req) {
  var advanceclaim = await Advanceclaim.findById(Id);
  advanceclaim._original = advanceclaim.toObject();
  advanceclaim.title = req.body.title,
  leaverequest.userid = req.body.userid,
  advanceclaim.property = req.body.property
  return await advanceclaim.save(req);
}

async function remove(Id, req) {
  var advanceclaim = await Advanceclaim.findById(Id);
  advanceclaim.status = "deleted"
  return await advanceclaim.save(req);
}

async function filter(params) {
  return await Advanceclaim.getbyfilter(params)
}

async function findcount(req) {
  return await Advanceclaim.findcount(req)
}

async function exportdata(params) {
  return await Advanceclaim.exportdata(params)
}
