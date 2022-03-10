const Joi = require('joi');
const Challan = require('../models/challan.model');

const challanSchema = Joi.object({
  chnumber: Joi.number().required(),
  prefix: Joi.string().required(),
  customerid: Joi.string().hex().required(),
  onModel: Joi.string().required(),
  type: Joi.string(),
  challandate : Joi.string(),
  items: Joi.array(),
  property: Joi.object()
})

module.exports = {
  insert,
  update,
  remove,
  filter,
  findcount,
  findbyId,
  exportdata,
  getnextchnumber
}

async function findbyId(Id) {
  var params = {}
  params.formname = "challan";
  params.search = [
    { "searchfield": "_id", "searchvalue": Id, "datatype": "ObjectId", "criteria": "eq" }
  ];
  var challans = await Challan.getbyfilter(params);
  if (challans && challans.length == 1)
  return challans[0];
}

async function insert(req) {
  var body = req.body;
  var challan = {
    chnumber: body.chnumber,
    prefix: body.prefix,
    customerid: body.customerid,
    onModel: body.onModel,
    challandate : body.challandate,
    type: body.type,
    items: body.items,
    property: body.property
  }
  await Joi.validate(challan, challanSchema, { abortEarly: false });
  return await new Challan(challan).save(req);
}

async function update(Id, req) {
  var challan = await Challan.findById(Id);
  challan._original = challan.toObject();
  var body = req.body;
  challan.customerid = body.customerid,
    challan.onModel = body.onModel,
    challan.type = body.type,
    challan.challandate = body.challandate,
    challan.items = body.items,
    challan.property = body.property
  return await challan.save(req)
}

async function remove(Id, req) {
  var challan = await Challan.findById(Id);
  challan.status = "deleted"
  return await challan.save(req);
}

async function filter(req) {
  return await Challan.getbyfilter(req)
}

async function getnextchnumber(req, res, next) {

  var branch = req.body.authkey.branchid;
  var prefix = "";

  if (DATABASETYPE == "branchwise") {
    var docformat = branch.docformat;
    prefix = docformat.challan ? docformat.challan["prefix"] : "CH";
  } else {
    var docformat = BILLFORMAT;
    if (docformat)
      prefix = docformat.challan ? docformat.challan["prefix"] : "CH";
  }

  Challan.getnextchnumber(prefix, branch._id)
    .then((chnumber) => {
      req.body.chnumber = chnumber;
      req.body.prefix = prefix;
      if (!req.body.customerid) return res.json(prefix + "-" + chnumber);
      else next();
    })
    .catch((e) => next1(e));
}

async function findcount(params) {
  return await Challan.findcount(params)
}

async function exportdata(params) {
  return await Challan.exportdata(params)
}
