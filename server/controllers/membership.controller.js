const Joi = require('joi');
const Membership = require('../models/membership.model');

const membershipSchema = Joi.object({
  membershipname: Joi.string().required(),
  profilepic : Joi.string(),
  property: Joi.object(),
})


module.exports = {
  insert,
  update,
  patch,
  remove,
  filter,
  filterview,
  findcount,
  findbyId,
  exportdata
}

async function findbyId(Id) {
  return await Membership.findById(Id);
}

async function insert(req) {
  var membership = {
    property: req.body.property,
    membershipname: req.body.membershipname,
  }
  await Joi.validate(membership, membershipSchema, { abortEarly: false });
  return await new Membership(membership).save(req);
}


async function patch(Id, req) {
  var membership = await Membership.findById(Id);
  membership._original = membership.toObject();
  if (req.body.subject) membership.subjects.push(req.body.subject);
  if (req.body.subjects) membership.subjects = req.body.subjects;
  if (req.body.usageterms) membership.usageterms = req.body.usageterms;
  if (req.body.profilepic) membership.profilepic = req.body.profilepic;
  return await membership.save(req);
}

async function update(Id, req) {
  var membership = await Membership.findById(Id);
  membership._original = membership.toObject();
  membership.property = req.body.property,
  membership.membershipname = req.body.membershipname,
  membership.items = req.body.items,
  membership.services = req.body.services,
  membership.assets = req.body.assets
  return await membership.save(req);
}

async function remove(Id, req) {
  var membership = await Membership.findById(Id);
  membership.status = "deleted"
  return await membership.save(req);
}

async function filter(params) {
  return await Membership.getbyfilter(params)
}

async function filterview(params) {
  return await Membershipview.getfilterview(params)
}

async function findcount(params) {
  return await Membership.findcount(params)
}

async function exportdata(params) {

  return await Membership.exportdata(params)
}
