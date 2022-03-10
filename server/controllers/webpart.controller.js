const Joi = require('joi');
const Webpart = require('../models/webpart.model');

const webpartSchema = Joi.object({
  formid: Joi.string().required()
})


module.exports = {
  insert,
  update,
  filter,
  findbyId,
  findAll
}

async function findAll(Id) {
  return await Webpart.find({ status: "active" }, { webparttype: 1, category: 1, schemaname: 1 });
}

async function findbyId(Id) {
  return await Webpart.findById(Id);
}

async function insert(req) {
  var webpart = req.body.webpart;
  webpart = await Joi.validate(webpart, webpartSchema, { abortEarly: false });
  return await new Webpart(webpart).save(req);
}

async function update(Id, req) {
  var webpart = await Webpart.findById(Id);
  webpart._original = webpart.toObject();
  return await webpart.save(req);
}

async function filter(req) {
  return await Webpart.getbyfilter(req)
}
