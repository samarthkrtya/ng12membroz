// const bcrypt = require('bcrypt');
const Joi = require('joi');
const Support = require('../models/support.model');

const supportSchema = Joi.object({
  prefix: Joi.string().required(),
  spnumber: Joi.number().required(),
  subject: Joi.string().required(),
  customerid: Joi.string().hex().required(),
  onModel : Joi.string(),
  category: Joi.string().required(),
  content: Joi.string().required(),
  attachments: Joi.array(),
  assignuserid: Joi.string().hex(),
  response: Joi.array(),
  supportrole: Joi.array(),
  property: Joi.object()
})


module.exports = {
  insert,
  update,
  patch,
  remove,
  filter,
  findcount,
  findbyId,
  getnextdocnumber,
  exportdata
}

async function findbyId(Id) {
  return await Support.findById(Id);
}

async function insert(req) {
  var support = {
    prefix: req.body.prefix,
    spnumber: req.body.spnumber,
    subject: req.body.subject,
    customerid: req.body.customerid,
    onModel: req.body.onModel,
    category: req.body.category,
    content: req.body.content,
    attachments: req.body.attachments,
    supportrole: req.body.supportrole,
    property: req.body.property
  }
  support = await Joi.validate(support, supportSchema, { abortEarly: false });
  return await new Support(support).save(req);
}

async function patch(Id, req) {
  var support = await Support.findById(Id);
  if (req.body.response) support.response.push(req.body.response);
  if (req.body.assignuserid) support.assignuserid = req.body.assignuserid;
  if (req.body.status) support.status = req.body.status;
  return await support.save(req);
}

async function update(Id, req) {
  var support = await Support.findById(Id);
  support._original = support.toObject();
  support.subject = req.body.subject,
  support.customerid = req.body.customerid,
  support.category = req.body.category,
  support.response = req.body.response,
  support.content = req.body.content,
  support.attachments = req.body.attachments,
  support.supportrole = req.body.supportrole,
  support.property = req.body.property
  return await support.save(req);
}

async function remove(Id, req) {
  var support = await Support.findById(Id);
  support.status = "deleted"
  return await support.save(req);
}

async function filter(params) {
  return await Support.getbyfilter(params)
}

async function getnextdocnumber(req, res, next) {

  var branch = req.body.authkey.branchid;
  var prefix = "";

  if (DATABASETYPE == "branchwise") {
    var docformat = branch.docformat;
    prefix = docformat.support ? docformat.support["prefix"] : "SP";
  } else {
    var docformat = BILLFORMAT;
    if (docformat)
      prefix = docformat.support ? docformat.support["prefix"] : "SP";
  }

  Support.getnextdocnumber(prefix, branch._id)
    .then((spnumber) => {
      req.body.spnumber = spnumber;
      req.body.prefix = prefix;
      if (!req.body.customerid) return res.json(prefix + "-" + spnumber);
      else next();
    })
    .catch((e) => next1(e));

}

async function findcount(req) {
  return await Support.findcount(req)
}

async function exportdata(params) {
  return await Support.exportdata(params)
}
