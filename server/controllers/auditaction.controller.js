// const bcrypt = require('bcrypt');
const Joi = require('joi');
const auditaction = require('../models/auditaction.model');
const auditactionSchema = Joi.object({
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
  return await auditaction.findById(Id);
}

async function insert(req) {
  var auditaction = {
  }
  auditaction = await Joi.validate(auditaction, auditactionSchema, { abortEarly: false });
  return await new auditaction(auditaction).save(req);
}

async function update(Id, req) {
  var auditaction = await auditaction.findById(Id);
  auditaction.action = req.body.action,
  auditaction.category = req.body.category
  return await auditaction.save(req);
}

async function remove(Id, req) {
  var auditaction = await auditaction.findById(Id);
  auditaction.status = "deleted"
  return await auditaction.save(req);
}

async function filter(params) {
  return await auditaction.getbyfilter(params)
}

async function findcount(req) {
  return await auditaction.findcount(req)
}

async function exportdata(params) {
  return await auditaction.exportdata(params)
}
