const Joi = require('joi');
const Communicationlog = require('../models/communicationlog.model');
const Communicationlogview = require('../views/communicationlog.view');

const communicationlogSchema = Joi.object({

})


module.exports = {
  filter,
  remove,
  findcount,
  findbyId,
  exportdata
}

async function filter(params) {
  return await Communicationlogview.getfilterview(params)
}

async function findbyId(Id) {
  return await Communicationlog.findById(Id);
}

async function remove(Id, req) {
  var communicationlo = await Communicationlog.findById(Id);
  communicationlo.status = "deleted"
  return await communicationlo.save(req);
}

// async function filter(params) {
//   return await Communicationlog.getbyfilter(params)
// }

async function findcount(req) {
  return await Communicationlog.findcount(req)
}

async function exportdata(params) {

  return await Communicationlog.exportdata(params)
}
