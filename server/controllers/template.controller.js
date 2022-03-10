const Joi = require('joi');
const Template = require('../models/template.model');
const commonCtrl = require('../controllers/common.controller');

const templateSchema = Joi.object({
  templatetype: Joi.string().required(),
  property: Joi.object(),
  content: Joi.string().required(),
  thumbnail: Joi.string().allow(null),
})


module.exports = {
  insert,
  update,
  patch,
  filter,
  findcount,
  findbyId,
  exportdata
}

async function findbyId(Id) {
  return await Template.findById(Id);
}

async function insert(req) {
  var template = {
    property: req.body.property,
    templatetype: req.body.templatetype, 
    content: req.body.content
  }
  await Joi.validate(template, templateSchema, { abortEarly: false });
  await commonCtrl.updatethumbnail(template);
  return await new Template(template).save(req);
}

async function update(Id, req) {
  var template = await Template.findById(Id);
  template._original = template.toObject();
  return await template.save(req);
}

async function patch(Id, req) {
  var template = await Template.findById(Id);
  template._original = template.toObject();
  if (req.body.template) template.template = req.body.template;
  return await template.save(req);
}

async function filter(params) {
  return await Template.getbyfilter(params)
}

async function findcount(req) {
  return await Template.findcount(req)
}

async function exportdata(params) {
  return await Template.exportdata(params)
}
