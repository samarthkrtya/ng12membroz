const Joi = require('joi');
const Formfieldoption = require('../models/formfieldoption.model');

const formSchema = Joi.object({
  formname: Joi.string().required()
})

module.exports = {
  insert,
  update,
  filter,
  findbyId,
  getschema,
  findcount,
  exportdata,
  getquickformschema
}

async function getquickformschema(req, res, next)
{
  var formname = req.params.formname;
  var branchid = req.body.branchid ? req.body.branchid: req.body.authkey.branchid._id;
  var query = {
    "formname": formname,
    "$or": [
       { "branchid": branchid },
       { "branchid": {  "$exists": false } },
    ]
  }

  Formfieldoption.find(query)
                 .sort({ "formorder": 1})
                 .then((formfields) =>{
                    req.body.formfields = formfields;
                    next();
                 })

}


async function findbyId(Id) {
  return await Formfieldoption.findById(Id);
}

async function insert(formfieldoption) {
  formfieldoption = await Joi.validate(formfieldoption, formSchema, { abortEarly: false });
  return await new Formfieldoption(formfieldoption).save(req);
}

async function update(Id) {
  var formfieldoption = await Formfieldoption.findById(Id);
  formfieldoption._original = formfieldoption.toObject();
  return await formfieldoption.save(req);
}

async function filter(req) {
  return await Formfieldoption.getbyfilter(req)
}

async function getschema(req, res, next){
  var rootonly = req.body.rootonly ? req.body.rootonly : false;
  var formname = req.params.formname;
  var fields = await Formfieldoption.getfieldsbyformname(formname, rootonly)
  next(fields)
}

async function findcount(params) {
  return await Formfieldoption.findcount(params)
}

async function exportdata(params) {
  return await Formfieldoption.exportdata(params)
}
