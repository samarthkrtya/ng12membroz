const Joi = require('joi');
const Quotation = require('../models/quotation.model');
const common = require('../helpers/common');

const quotationSchema = Joi.object({
  prefix: Joi.string(),
  requestnumber: Joi.number().required(),
  customerid: Joi.string().hex().required(),
  onModel: Joi.string().required(),
  date: Joi.date().required(),
  amount : Joi.number(),
  advisorid : Joi.string().hex(),
  totalamount : Joi.number(),
  balance : Joi.number(),
  discount : Joi.number(),
  taxamount : Joi.number(),
  taxdetail: Joi.object(),
  items : Joi.array(),
  services : Joi.array(),
  assets : Joi.array(),
  type : Joi.string(),
  property : Joi.object()
})

module.exports = {
  insert,
  update,
  remove,
  filter,
  patch,
  findcount,
  findbyId,
  exportdata,
  getnextdocnumber,
  converttobill,
  converttoquotation
}

async function findbyId(Id) {
  return await Quotation.findById(Id);
}

async function getnextdocnumber(req, res, next) {

  var branch = req.body.authkey.branchid;
  var prefix = "";

  if (DATABASETYPE == "branchwise") {
    var docformat = branch.docformat;
    prefix = docformat.quotation ? docformat.quotation["prefix"] : "QN";
  } else {
    var docformat = BILLFORMAT;
    if (docformat)
      prefix = docformat.quotation ? docformat.quotation["prefix"] : "QN";
  }

  Quotation.getnextdocnumber(prefix, branch._id)
    .then((requestnumber) => {
      req.body.requestnumber = requestnumber;
      req.body.prefix = prefix;
      if (!req.body.customerid) return res.json(prefix + "-" + requestnumber);
      else next();
    })
    .catch((e) => next(e));

}

async function insert(req) {
  var body = req.body;
  var quotation = {
    prefix: body.prefix,
    requestnumber: body.requestnumber,
    customerid: body.customerid,
    onModel: body.onModel,
    date: body.date,
    amount: body.amount,
    advisorid: body.advisorid,
    totalamount: body.totalamount,
    discount: body.discount,
    taxamount: body.taxamount,
    items: body.items,
    services: body.services,
    assets: body.assets,
    type: body.type,
    property: body.property
  }

  common.updatesaledetail(quotation, body);
  await Joi.validate(quotation, quotationSchema, { abortEarly: false });
  return await new Quotation(quotation).save(req);
}

async function update(Id, req) {

  var quotation = await Quotation.findById(Id);
  quotation._original = quotation.toObject();
  quotation.customerid = req.body.customerid,
  quotation.onModel = req.body.onModel,
  quotation.date = req.body.date,
  quotation.totalamount = req.body.totalamount,
  quotation.discount = req.body.discount,
  quotation.taxamount = req.body.taxamount,
  quotation.advisorid = req.body.advisorid,
  quotation.items = [],
  quotation.services = req.body.services,
  quotation.assets = req.body.assets,
  quotation.type = req.body.type,
  quotation.property = req.body.property

  common.updatesaledetail(quotation, req.body);
  
  return await quotation.save(req)
}

async function converttobill(req, res, next) {
  var Id = req.params.Id;

  var quotations = await Quotation.findById(Id);
  req.body.customerid = (quotations.customerid._id).toString(),
  req.body.onModel = quotations.onModel,
  req.body.billdate = new Date(),
  req.body.duedate = new Date(),
  req.body.type = quotations.type == 'pos' ? 'POS' : quotations.type == 'asset' ? 'facilitybooking' : 'appointment',
  req.body.items = quotations.items,
  req.body.services = quotations.services,
  req.body.assets = quotations.assets,
  req.body.amount = quotations.amount,
  req.body.totalamount = quotations.totalamount,
  req.body.taxamount = quotations.taxamount,
  req.body.taxdetail = quotations.taxdetail,
  req.body.discount = quotations.discount,
  req.body.property = quotations.property

  next();
}

async function converttoquotation(req, res, next) {

  var body = req.body;
  var quotation = {
    prefix: body.prefix,
    requestnumber: body.requestnumber,
    customerid: body.customerid,
    onModel: body.convertModel,
    date: body.convertdate,
    amount: body.amount,
    advisorid: body.advisorid,
    type: body.type,
    totalamount: body.totalamount,
    discount: body.discount,
    taxamount: body.taxamount,
    items: body.items,
    services: body.services,
    assets: body.assets,
    type: body.type,
    property: {
      inspectionid: body.inspectionid,
      assetid: body.contextid
    }
  }

  common.updatesaledetail(quotation, body);
  
  await Joi.validate(quotation, quotationSchema, { abortEarly: false });
  var quotationres =  await new Quotation(quotation).save(req);
  req.body.quotationid = quotationres._id
  next();
}

async function patch(Id, req) {
  var quotation = await Quotation.findById(Id);
  quotation._original = quotation.toObject();

  if (req.body.billid) quotation.billid = req.body.billid;
  if (req.body.status) quotation.status = req.body.status;
  
  return await quotation.save(req);
}

async function remove(Id, req) {
  var quotation = await Quotation.findById(Id);
  quotation.status = "deleted"
  return await quotation.save(req);
}

async function filter(req) {
  return await Quotation.getbyfilter(req)
}

async function findcount(params) {
  return await Quotation.findcount(params)
}

async function exportdata(params) {
  return await Quotation.exportdata(params)
}
