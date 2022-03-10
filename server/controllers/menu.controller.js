const Joi = require('joi');
const Menu = require('../models/menu.model');
const Usermenu = require('../views/usermenu.view');

const menuSchema = Joi.object({
  menuname: Joi.string().required()
})


module.exports = {
  filter,
  filterUsermenu,
  findcount,
  exportdata
}

async function filter(req) {
  return await Menu.getbyfilter(req)
}

async function filterUsermenu(req) {
  return await Usermenu.getbyfilter(req)
}

async function findcount(params) {
  return await Menu.findcount(params)
}

async function exportdata(params) {
  return await Menu.exportdata(params)
}
