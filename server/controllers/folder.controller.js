// const bcrypt = require('bcrypt');
const Joi = require('joi');
const Folder = require('../models/folder.model');

const folderSchema = Joi.object({
  title: Joi.string().required(),
  parent: Joi.string().hex(),
  shared: Joi.array(),
  property: Joi.object(),
  status: Joi.string(),
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
  return await Folder.findById(Id);
}

async function insert(req) {
  var folder = {
    title: req.body.title,
    parent: req.body.parent,
    shared: req.body.shared,
    property: req.body.property,
    status: req.body.status,
  }
  folder = await Joi.validate(folder, folderSchema, { abortEarly: false });
  return await new Folder(folder).save(req);
}

async function update(Id, req) {
  var folder = await Folder.findById(Id);
  folder._original = folder.toObject();
  folder.title = req.body.title,
  folder.parent = req.body.parent,
  folder.shared = req.body.shared,
  folder.property = req.body.property,
  folder.status = req.body.status
  return await folder.save(req);
}

async function patch(Id, req) {
  var folder = await Folder.findById(Id);
  folder._original = folder.toObject();
  if (req.body.parent) folder.parent = req.body.parent == 'My Drive' ? undefined : req.body.parent;
  if (req.body.title) folder.title = req.body.title;
  if (req.body.shared) folder.shared = req.body.shared;
  if (req.body.status) folder.status = req.body.status;
  return await folder.save(req);
}

async function remove(Id, req) {
  var folder = await Folder.findById(Id);
  folder.status = "deleted"
  return await folder.save(req);
}

async function filter(params) {
  return await Folder.getbyfilter(params)
}

async function findcount(req) {
  return await Folder.findcount(req)
}

async function exportdata(params) {
  return await Folder.exportdata(params)
}
