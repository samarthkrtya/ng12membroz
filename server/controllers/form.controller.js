const Joi = require('joi');
const Form = require('../models/form.model');
const Formview = require('../views/form.view');
const Inspectionview = require('../views/inspection.view');
const Formschema = require('../views/formschema.view');

const formSchema = Joi.object({
  formname: Joi.string().required(),
  formlistname: Joi.string().allow(null),
  dispalyformname: Joi.string().allow(null),
  schemaname: Joi.string().allow(null),
  formtype: Joi.string(),
  doctemplate: Joi.string().allow(null),
  branchid: Joi.string().hex(),
  addedby: Joi.string().hex(),
  property: Joi.object().allow(null),
  
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
  getformschema,
  integrationview,
  inspectionfilterview
}

async function findbyId(Id) {
  return await Form.findById(Id);
}

async function patch(Id, req) {
  var form = await Form.findById(Id);
  form._original = form.toObject();
  if (req.body.rootfields) form.rootfields = req.body.rootfields;

  if (req.body.dispalyformname) form.dispalyformname = req.body.dispalyformname;

  return await form.save(req);
}


async function insert(req) {
  var branchid = req.body.authkey.branchid._id.toString();
  var addedby = req.body.authkey._id.toString();
  var form = {
    formname: req.body.formname,
    formlistname: req.body.formlistname,
    dispalyformname: req.body.dispalyformname,
    schemaname: req.body.schemaname,
    doctemplate: req.body.doctemplate,
    formtype: req.body.formtype,
    branchid: branchid,
    addedby: addedby,
    property: req.body.property
  }
  form = await Joi.validate(form, formSchema, { abortEarly: false });
  return await new Form(form).save(req);
}

async function update(Id) {
  var form = await Form.findById(Id);
  form._original = form.toObject();
  return await form.save(req);
}

async function filter(req) {
  return await Form.getbyfilter(req)
}

async function remove(Id, req) {
  var form = await Form.findById(Id);
  form.status = "deleted"
  return await form.save(req);
}


async function integrationview(req) {
  return await Formview.getfilterview(req)
}

async function inspectionfilterview(req) {
  return await Inspectionview.getfilterview(req)
}



async function getformschema(req, res, next) {
  var branchid = req.body.authkey.branchid._id;
  var formid = req.body.formid;
  var data = await Formschema.getbyfilter(formid, branchid)
  next(data)
}

async function findcount(params) {
  return await Form.findcount(params)
}

async function exportdata(params) {
  return await Form.exportdata(params)
}
