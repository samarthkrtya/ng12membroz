const Joi = require('joi');
const Purchaserequest = require('../models/purchaserequest.model');
const common = require('../helpers/common');

const purchaserequestSchema = Joi.object({
  requestnumber: Joi.number().required(),
  prefix: Joi.string().required(),
  date: Joi.date().required(),
  items: Joi.array().required(),
  totalamount: Joi.number().required(),
  taxamount: Joi.number(),
  taxdetail: Joi.object(),
  amount: Joi.number().required(),
  attachments: Joi.array(),
  property: Joi.object()
})


module.exports = {
  insert,
  update,
  remove,
  filter,
  findbyId,
  findcount,
  getnextdocnumber,
  exportdata
}

async function findbyId(Id) {
  var params = {}
  params.formname = "purchaserequest";
  params.search = [
    { "searchfield": "_id", "searchvalue": Id, "datatype": "ObjectId", "criteria": "eq" }
  ];
  var purchaserequests = await Purchaserequest.getbyfilter(params);
  if (purchaserequests && purchaserequests.length == 1)
  return purchaserequests[0];
}

async function insert(req) {
  var body = req.body;
  var purchaserequest = {
    requestnumber: body.requestnumber,
    prefix: body.prefix,
    date: body.date,
    items: body.items,
    amount: body.amount ? body.amount:0,
    totalamount: body.totalamount,
    taxamount: body.taxamount,
    attachments: body.attachments,
    property: body.property
  }

  common.updatepurchasedetail(purchaserequest, body);

  await Joi.validate(purchaserequest, purchaserequestSchema, { abortEarly: false });
  return await new Purchaserequest(purchaserequest).save(req);
}

async function update(Id, req) {

  var body = req.body;
  var purchaserequest = await Purchaserequest.findById(Id);
  purchaserequest._original = purchaserequest.toObject();
  purchaserequest.date = body.date,
  purchaserequest.items = [],
  purchaserequest.totalamount = body.totalamount,
  purchaserequest.amount = body.amount,
  purchaserequest.taxamount = body.taxamount,
  purchaserequest.attachments = body.attachments,
  purchaserequest.property = body.property

  common.updatepurchasedetail(purchaserequest, body);

  return await purchaserequest.save(req);
}

async function remove(Id, req) {
  var purchaserequest = await Purchaserequest.findById(Id);
  purchaserequest.status = "deleted"
  return await purchaserequest.save(req);
}

async function filter(params) {
  return await Purchaserequest.getbyfilter(params)
}

async function getnextdocnumber(req, res, next) {

  var branch = req.body.authkey.branchid;
  var prefix = "";

  if (DATABASETYPE == "branchwise") {
    var docformat = branch.docformat;
    prefix = docformat.purchaserequest ? docformat.purchaserequest["prefix"] : "PR";
  } else {
    var docformat = BILLFORMAT;
    if (docformat)
      prefix = docformat.purchaserequest ? docformat.purchaserequest["prefix"] : "PR";
  }

  Purchaserequest.getnextdocnumber(prefix, branch._id)
    .then((requestnumber) => {
      req.body.requestnumber = requestnumber;
      req.body.prefix = prefix;
      if (!req.body.items) return res.json(prefix + "-" + requestnumber);
      else next();
    })

}

async function findcount(req) {
  return await Purchaserequest.findcount(req)
}

async function exportdata(params) {
  return await Purchaserequest.exportdata(params)
}

