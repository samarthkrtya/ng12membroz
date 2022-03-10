const Joi = require('joi');
const Saleschannel = require('../models/saleschannel.model');

const saleschannelSchema = Joi.object({
  channelname: Joi.string().required(),
  channelhead: Joi.string().hex().required(),
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
  return await Saleschannel.findById(Id);
}

async function insert(req) {
  var saleschannel = {
    property: req.body.property,
    channelname: req.body.channelname,
    channelhead: req.body.channelhead,
  }
  await Joi.validate(saleschannel, saleschannelSchema, { abortEarly: false });
  return await new Saleschannel(saleschannel).save(req);
}

async function update(Id, req) {
  var saleschannel = await Saleschannel.findById(Id);
  saleschannel._original = saleschannel.toObject();
  saleschannel.property = req.body.property,
  saleschannel.channelname = req.body.channelname,
  saleschannel.channelhead = req.body.channelhead,
  saleschannel.channels = req.body.channels

  return await saleschannel.save(req);
}

async function remove(Id, req) {
  var saleschannel = await Saleschannel.findById(Id);
  saleschannel.status = "deleted"
  return await saleschannel.save(req);
}

async function filter(params) {
  return await Saleschannel.getbyfilter(params)
}

async function findcount(req) {
  return await Saleschannel.findcount(req)
}

async function exportdata(params) {
  return await Saleschannel.exportdata(params)
}
