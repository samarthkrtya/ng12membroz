const Joi = require('joi');
const Languageresource = require('../models/languageresource.model');

const languageresourceSchema = Joi.object({

})


module.exports = {
  insert,
  update,
  filter,
  findbyId,
  findcount,
  exportdata
}

async function findbyId(Id) {
  return await Languageresource.findById(Id);
}

async function insert(req) {
  languageresource = await Joi.validate(languageresource, languageresourceSchema, { abortEarly: false });
  languageresource.hashedPassword = bcrypt.hashSync(languageresource.password, 10);
  delete languageresource.password;
  return await new Languageresource(languageresource).save(req);
}

async function update(Id, req) {
  var languageresource = await Languageresource.findById(Id);
  return await languageresource.save(req);
}

async function filter(req) {
  var localresources = await Languageresource.getbyfilter(req)
  var globalresource = await Languageresource.find({ "componentname": "global" });
  return localresources.concat(globalresource);
}

async function findcount(params) {
  return await Languageresource.findcount(params)
}

async function exportdata(params) {
  return await Languageresource.exportdata(params)
}
