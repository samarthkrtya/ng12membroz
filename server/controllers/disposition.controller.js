const Joi = require('joi');
const Disposition = require('../models/disposition.model');
var ObjectID = require('mongodb').ObjectID;

const dispositionSchema = Joi.object({
  disposition: Joi.string().required(),
  parentid: Joi.string().allow(null),
  action: Joi.string().allow('', null),
  formid: Joi.string().hex().required(),
  fields: Joi.array(),
  property: Joi.object()
})


module.exports = {
  insert,
  patch,
  update,
  filter,
  findbyId,
  findcount,
  exportdata,
  convertdatatype,
  remove
}

async function convertdatatype(req, res, next) {

  var property = req.body.property;
  var dispositionid = req.body.dispositionid;

  if (property)
  {
    Disposition.findById(dispositionid)
      .then((disposition) => {

        var fields = disposition.fields;

        fields.forEach(function (field) {
          if (field.fieldtype == "datepicker" && property[field.fieldname]) {
            var date = new Date(property[field.fieldname]);
            property[field.fieldname] = date;
          }
          if (field.fieldtype == "number" && property[field.fieldname]) {
            property[field.fieldname] = parseFloat(property[field.fieldname]);
          }
          if (field.fieldtype == "form" && property[field.fieldname]) {
            property[field.fieldname] = ObjectID(property[field.fieldname])
          }
          if (field.fieldtype == "form_multiselect" && property[field.fieldname]) {
            var arr = property[field.fieldname];
            var newarry = [];
            arr.forEach(function (obj) {
              newarry.push(ObjectID(obj));
            })
            property[field.fieldname] = newarry;
          }
        });

        var followupdate = property.followupdate
        if (followupdate && new Date(followupdate) instanceof Date) {
          property.followupdate = new Date(followupdate)
        }
        else property.followupdate = undefined;

        var assignto = property.assignto
        if (assignto && ObjectID(assignto)) {
          property.assignto = ObjectID(assignto)
        }
        else property.assignto = undefined;

        property.followup = undefined;
        req.body.property = property;

        next();
      })
  }
  else next();
}

async function findbyId(Id) {
  return await Disposition.findById(Id);
}

async function insert(req) {
  var body = req.body;
  var disposition = {
    disposition: body.disposition,
    parentid: body.parentid,
    action: body.action,
    formid: body.formid,
    fields: body.fields,
    property: body.property
  }
  await Joi.validate(disposition, dispositionSchema, { abortEarly: false });
  return await new Disposition(disposition).save(req);
}

async function update(Id, req) {
  var body = req.body;
  var disposition = await Disposition.findById(Id);
  disposition._original = disposition.toObject();
  disposition.disposition = body.disposition,
  disposition.action = body.action,
  disposition.fields = body.fields,
  disposition.rules = body.rules,
  disposition.property = body.property
  return await disposition.save(req)
}

async function patch(Id, req) {
  var disposition = await Disposition.findById(Id);
  disposition._original = disposition.toObject();
  if (req.body.disposition) disposition.disposition = req.body.disposition;
  if (req.body.action) disposition.action = req.body.action;
  if (req.body.fields) disposition.fields = req.body.fields;
  if (req.body.property) disposition.property = req.body.property;
  if (req.body.rulesadd) {
    disposition.rules.push(req.body.rules);
  } else if (req.body.rules) disposition.rules = req.body.rules;
  return await disposition.save(req);
}

async function remove(Id, req) {
  var disposition = await Disposition.findById(Id);
  disposition.status = "deleted"
  return await disposition.save(req);
}

async function filter(req) {
  return await Disposition.getbyfilter(req)
}

async function findcount(params) {
  return await Disposition.findcount(params)
}

async function exportdata(params) {
  return await Disposition.exportdata(params)
}
