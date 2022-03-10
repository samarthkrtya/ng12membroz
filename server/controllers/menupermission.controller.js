const Joi = require('joi');
const Menupermission = require('../models/menupermission.model');

const menupermissionSchema = Joi.object({
  menuid: Joi.array().required(),
  roleid: Joi.string().hex().required()
})


module.exports = {
  filter,
  update,
  findcount,
  exportdata
}

async function filter(req) {
  return await Menupermission.getbyfilter(req)
}

async function update(Id, req) {

  var body = req.body;
  var menu = await Menupermission.findOne({ roleid: Id });

  var filtered = body.menuid.filter(function (el) {
    return el != null;
  });
  if (menu == null) {
    var menu = {
      menuid: filtered,
      roleid: Id
    }
    return await new Menupermission(menu).save(req);
  }
  else {
    var menu = await Menupermission.findOneAndUpdate({ roleid: Id }, { "$set": { "menuid": filtered } }, { new: true });
    return menu;
  }

}

async function findcount(params) {
  return await Menupermission.findcount(params)
}

async function exportdata(params) {
  return await Menupermission.exportdata(params)
}
