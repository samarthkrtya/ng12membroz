const Joi = require('joi');
const Activitytemplate = require('../models/activitytemplate.model');

const activitytemplateSchema = Joi.object({
  title: Joi.string().required(),
  dispositionid: Joi.string().hex().required(),
  content: Joi.string(),
  type: Joi.string(),
  priority: Joi.string(),
  mappingfields: Joi.string(),
  formid: Joi.string().hex().required(),
  duedate: Joi.object(),
  assingeeuser: Joi.array().required(),
  assingeerole: Joi.array().required(),
  attachment : Joi.object(),
  property : Joi.object()
})


module.exports = {
  insert,
  update,
  patch,
  filter,
  findbyId,
  findcount,
  exportdata
}

async function findbyId(Id) {
  return await Activitytemplate.findById(Id);
}

async function insert(req) {

  var body = req.body;
  var activitytemplate = {
    title: body.title,
    dispositionid: body.dispositionid,
    content: body.content,
    type: body.type,
    formid: body.formid,
    priority: body.priority,
    duedate: body.duedate,
    mappingfields: body.mappingfields,
    assingeeuser: body.assingeeuser,
    assingeerole: body.assingeerole,
    attachment: body.attachment,
    property: body.property,
  }

  await Joi.validate(activitytemplate, activitytemplateSchema, { abortEarly: false });
  return await new Activitytemplate(activitytemplate).save(req);
}

async function update(Id, req) {
  var body = req.body;
  var activitytemplate = await Activitytemplate.findById(Id);
  activitytemplate._original = activitytemplate.toObject();

  activitytemplate.title =  body.title,
  activitytemplate.dispositionid = body.dispositionid,
  activitytemplate.content = body.content,
  activitytemplate.type = body.type,
  activitytemplate.formid = body.formid,
  activitytemplate.priority = body.priority,
  activitytemplate.duedate = body.duedate,
  activitytemplate.mappingfields = body.mappingfields,
  activitytemplate.assingeeuser = body.assingeeuser,
  activitytemplate.assingeerole = body.assingeerole,
  activitytemplate.attachment = body.attachment,
  activitytemplate.property = body.property

  return await activitytemplate.save(req)
}

async function patch(Id, req) {
  var activitytemplate = await Activitytemplate.findById(Id);
  activitytemplate._original = activitytemplate.toObject();
  activitytemplate.property = req.body.property,
  activitytemplate.status = req.body.status
  return await activitytemplate.save(req)
}

async function filter(req) {
  return await Activitytemplate.getbyfilter(req)
}

async function findcount(params) {
  return await Activitytemplate.findcount(params)
}

async function exportdata(params) {
  return await Activitytemplate.exportdata(params)
}
