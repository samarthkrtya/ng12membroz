const Joi = require('joi');
const Role = require('../models/role.model');
const Roleview = require('../views/role.view');

const roleSchema = Joi.object({
  rolename: Joi.string().required(),
  dashboard: Joi.string().hex(),
  property: Joi.object()
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
  return await Role.findById(Id);
}

async function insert(req) {
  var role = {
    rolename: req.body.rolename,
    dashboard: req.body.dashboard,
    property: req.body.property,
  }
  role = await Joi.validate(role, roleSchema, { abortEarly: false });
  return await new Role(role).save(req);
}

async function update(Id, req) {
  var role = await Role.findById(Id);
  role._original = role.toObject();
  role.rolename = req.body.rolename
  role.dashboard = req.body.dashboard,
  role.property = req.body.property,
  role.permissions = req.body.permissions;
  role.dispositionpermissions = req.body.dispositionpermissions;
  role.reportpermissions = req.body.reportpermissions;
  role.functionpermissions = req.body.functionpermissions;
  return await role.save(req);
}

async function patch(Id, req) {
  var role = await Role.findById(Id);
  role._original = role.toObject();
  if (req.body.permissions) role.permissions = req.body.permissions;
  if (req.body.dispositionpermission) role.dispositionpermissions.push(req.body.dispositionpermission);
  if (req.body.dispositionpermissions) role.dispositionpermissions = req.body.dispositionpermissions;
  if (req.body.reportpermissions) role.reportpermissions= req.body.reportpermissions;
  if (req.body.bireportpermissions) role.bireportpermissions = req.body.bireportpermissions;
  if (req.body.functionpermissions) role.functionpermissions = req.body.functionpermissions;
  return await role.save(req);
}

async function remove(Id, req) {
  var role = await Role.findById(Id);
  role.status = "deleted"
  return await role.save(req);
}

async function filter(params) {
  return await Role.getbyfilter(params)
}

async function filterview(params) {
  return await Roleview.getfilterview(params)
}

async function findcount(req) {
  return await Role.findcount(req)
}

async function exportdata(params) {
  return await Role.exportdata(params)
}
