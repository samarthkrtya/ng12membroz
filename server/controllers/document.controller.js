// const bcrypt = require('bcrypt');
const Joi = require('joi');
const Document = require('../models/document.model');
const Documentview = require('../views/document.view');
const Documentfullview = require('../views/documentfull.view');

const documentSchema = Joi.object({
  title: Joi.string().required(),
  path: Joi.string().required(),
  parent: Joi.string(),
  size: Joi.number(),
  shared: Joi.array(),
  onModel: Joi.string(),
  formid: Joi.string().hex().allow(null),
  property: Joi.object(),
  status: Joi.string(),
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
  return await Document.findById(Id);
}

async function insert(req) {
  var document = {
    title: req.body.title,
    path: req.body.path,
    parent: req.body.parent,
    size: req.body.size,
    shared: req.body.shared,
    onModel: req.body.onModel,
    formid: req.body.formid,
    property: req.body.property,
    status: req.body.status
  }
  document = await Joi.validate(document, documentSchema, { abortEarly: false });
  return await new Document(document).save(req);
}

async function update(Id, req) {
  var document = await Document.findById(Id);
  document._original = document.toObject();
  document.title = req.body.title,
  document.path = req.body.path,
  document.parent = req.body.parent,
  document.size = req.body.size,
  document.shared = req.body.shared,
  document.onModel = req.body.onModel,
  document.formid = req.body.formid,
  document.property = req.body.property,
  document.status = req.body.status
  return await document.save(req);
}

async function patch(Id, req) {
  var document = await Document.findById(Id);
  document._original = document.toObject();
  if (req.body.parent) document.parent = req.body.parent == 'My Drive' ? undefined : req.body.parent;
  if (req.body.title) document.title = req.body.title;
  if (req.body.shared) document.shared = req.body.shared;
  if (req.body.onModel) document.onModel = req.body.onModel;
  if (req.body.status) document.status = req.body.status;
  return await document.save(req);
}

async function remove(Id, req) {
  var document = await Document.findById(Id);
  document.status = "deleted"
  return await document.save(req);
}

async function filter(params) {
  return await Document.getbyfilter(params)
}

async function filterview(req) {
  var params= req.body;
  var permissions = req.body.authkey.role.permissions;
  var docpermssion = permissions.find((permission)=>{
    return permission.formname == "documentsummary";
  })

  if (docpermssion)
    return await Documentfullview.getfilterview(params)
  else
    return await Documentview.getfilterview(params)
}

async function findcount(req) {
  return await Document.findcount(req)
}

async function exportdata(params) {
  return await Document.exportdata(params)
}
