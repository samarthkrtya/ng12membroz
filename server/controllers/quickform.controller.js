const Joi = require('joi');
const Quickform = require('../models/quickform.model');

const quickformSchema = Joi.object({
  icon: Joi.string().required(),
  dispalytext: Joi.string().required(),
  schemaname: Joi.string().required(),
  formname: Joi.string().required(),
  url: Joi.string().required(),
  order: Joi.number().required(),
  linktype: Joi.string().required(),
})


module.exports = {
  insert,
  update,
  patch,
  remove,
  filter,
  findcount,
  findbyId,
}

async function findbyId(Id) {
  return await Quickform.findById(Id);
}

async function insert(req) {
  var quickform = {
    icon: req.body.icon,
    dispalytext: req.body.dispalytext,
    schemaname: req.body.schemaname,
    formname: req.body.formname,
    url: req.body.url,
    order: req.body.order,
    linktype: req.body.linktype
  }
  await Joi.validate(quickform, quickformSchema, { abortEarly: false });
  return await new Quickform(quickform).save(req);
}

async function update(Id, req) {
  var quickform = await Quickform.findById(Id);
  quickform._original = quickform.toObject();
  quickform.icon = req.body.icon
  quickform.dispalytext = req.body.dispalytext
  quickform.schemaname = req.body.schemaname
  quickform.formname = req.body.formname
  quickform.url = req.body.url
  quickform.order = req.body.order
  quickform.linktype = req.body.linktype
  return await quickform.save(req);
}

async function patch(Id, req) {
  var quickform = await Quickform.findById(Id);
  quickform._original = quickform.toObject();
  if (req.body.icon) quickform.icon = req.body.icon;
  if (req.body.dispalytext) quickform.dispalytext = req.body.dispalytext;
  if (req.body.schemaname) quickform.schemaname = req.body.schemaname;
  if (req.body.formname) quickform.formname = req.body.formname;
  if (req.body.url) quickform.url = req.body.url;
  if (req.body.order) quickform.order = req.body.order;
  if (req.body.linktype) quickform.linktype = req.body.linktype;
  return await quickform.save(req);
}

async function remove(Id, req) {
  var quickform = await Quickform.findById(Id);
  quickform.status = "deleted"
  return await quickform.save(req);
}

async function filter(params) {
  return await Quickform.getbyfilter(params)
}

async function findcount(req) {
  return await Quickform.findcount(req)
}
