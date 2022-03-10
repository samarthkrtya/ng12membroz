const Joi = require('joi');
const Formlist = require('../models/formlist.model');
const Formlistview = require('../views/formlist.view');

const formSchema = Joi.object({
  formname: Joi.string().required()
})


module.exports = {
  insert,
  update,
  patch,
  filter,
  filterview,
  findbyId,
  filterformlist,
  findcount,
  exportdata
}

async function findbyId(Id) {
  return await Formlist.findById(Id);
}

async function insert(form) {
  form = await Joi.validate(form, formSchema, { abortEarly: false });
  return await new Formlist(form).save(req);
}

async function update(Id) {
  var formlist = await Formlist.findById(Id);
  formlist._original = formlist.toObject();
  return await formlist.save(req);
}

async function patch(Id, req) {
  var formlist = await Formlist.findById(Id);
  formlist._original = formlist.toObject();
  if (req.body.selectfields) formlist.selectfields = req.body.selectfields;
  if (req.body.filterfields) formlist.filterfields = req.body.filterfields;
  if (req.body.sortfields) formlist.sortfields = req.body.sortfields;
  return await formlist.save(req);
}

async function filter(req) {
  return await Formlist.getbyfilter(req)
}

async function filterview(req) {
  return await Formlistview.getfilterview(req)
}

async function filterformlist(params) {
  params = { "search": [ { "searchfield": "formname", "searchvalue": [ "measurements", "bodycomposition", "analyticaldata", "labreport", "assessments"], "criteria": "in", "datattype": "text" } ] }
  return await Formlist.getbyfilter(params)
}

async function findcount(params) {
  return await Formlist.findcount(params)
}

async function exportdata(params) {
  return await Formlist.exportdata(params)
}
