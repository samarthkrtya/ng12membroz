const Joi = require('joi');
const Saleschannelteam = require('../models/saleschannelteam.model');

const saleschannelSchema = Joi.object({
  salesteamname: Joi.string().required(),
  saleschannelid: Joi.string().hex().required(),
  teamhead: Joi.string().hex(),
  property: Joi.object().required()
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
  return await Saleschannelteam.findById(Id);
}

async function insert(req) {
  var saleschannelteam = {
    property: req.body.property,
    salesteamname: req.body.salesteamname,
    saleschannelid: req.body.saleschannelid,
    teamhead: req.body.teamhead,
    // teamhead: "60067310eec109216a752592",
  }
  await Joi.validate(saleschannelteam, saleschannelSchema, { abortEarly: false });
  return await new Saleschannelteam(saleschannelteam).save(req);
}

async function update(Id, req) {
  var saleschannelteam = await Saleschannelteam.findById(Id);
  saleschannelteam._original = saleschannelteam.toObject();
  saleschannelteam.property = req.body.property,
  saleschannelteam.salesteamname = req.body.salesteamname,
  saleschannelteam.channels = req.body.channels,
  saleschannelteam.teamhead = req.body.teamhead,
  saleschannelteam.saleschannelid = req.body.saleschannelid
  //console.log("saleschannelteam", saleschannelteam)
  return await saleschannelteam.save(req);
}

async function remove(Id, req) {
  var saleschannelteam = await Saleschannelteam.findById(Id);
  saleschannelteam.status = "deleted"
  return await saleschannelteam.save(req);
}

async function filter(params) {
  return await Saleschannelteam.getbyfilter(params)
}

async function findcount(req) {
  return await Saleschannelteam.findcount(req)
}

async function exportdata(params) {
  return await Saleschannelteam.exportdata(params)
}
