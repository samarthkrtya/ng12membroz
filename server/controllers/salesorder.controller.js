const Joi = require('joi');
const Salesorder = require('../models/salesorder.model');
const common = require('../helpers/common');

const salesorderSchema = Joi.object({
  prefix: Joi.string(),
  sonumber: Joi.number().required(),
  customerid: Joi.string().hex().required(),
  onModel: Joi.string().required(),
  orderdate: Joi.date().required(),
  shipmentdate: Joi.date(),
  type: Joi.string(),
  amount : Joi.number(),
  totalamount : Joi.number(),
  balance : Joi.number(),
  discount : Joi.number(),
  taxamount : Joi.number(),
  taxdetail: Joi.object(),
  items : Joi.array(),
  services : Joi.array(),
  assets : Joi.array(),
  property : Joi.object()
})

module.exports = {
  insert,
  update,
  remove,
  filter,
  findcount,
  findbyId, 
  exportdata,
  getnextdocnumber,
  converttobill
}

async function findbyId(Id) {
  return await Salesorder.findById(Id);
}

async function getnextdocnumber(req, res, next) {

  var branch = req.body.authkey.branchid;
  var prefix = "";

  if (DATABASETYPE == "branchwise") {
    var docformat = branch.docformat;
    prefix = docformat.salesorder ? docformat.salesorder["prefix"] : "PI";
  } else {
    var docformat = BILLFORMAT;
    if (docformat)
      prefix = docformat.salesorder ? docformat.salesorder["prefix"] : "PI";
  }

  Salesorder.getnextdocnumber(prefix, branch._id)
    .then((sonumber) => {
      req.body.sonumber = sonumber;
      req.body.prefix = prefix;
      if (!req.body.customerid) return res.json(prefix + "-" + sonumber);
      else next();
    })
    .catch((e) => next1(e));

}

async function insert(req) {
  var salesorder = {
    prefix: req.body.prefix,
    sonumber: req.body.sonumber,
    customerid: req.body.customerid,
    onModel: req.body.onModel,
    orderdate: req.body.orderdate,
    shipmentdate: req.body.shipmentdate,
    type: req.body.type,
    totalamount: req.body.totalamount,
    balance: req.body.balance,
    discount: req.body.discount,
    taxamount: req.body.taxamount,
    items: req.body.items,
    services: req.body.services,
    assets: req.body.assets,
    property: req.body.property
  }

  common.updatesaledetail(salesorder, req.body);

  await Joi.validate(salesorder, salesorderSchema, { abortEarly: false });
  return await new Salesorder(salesorder).save(req);
}

async function update(Id, req) {

  var salesorder = await Salesorder.findById(Id);
  salesorder._original = salesorder.toObject();
  salesorder.customerid = req.body.customerid,
  salesorder.onModel = req.body.onModel,
  salesorder.orderdate = req.body.orderdate,
  salesorder.shipmentdate = req.body.shipmentdate,
  salesorder.type = req.body.type,
  salesorder.totalamount = req.body.totalamount,
  salesorder.balance = req.body.balance,
  salesorder.discount = req.body.discount,
  salesorder.taxamount = req.body.taxamount,
  salesorder.items = [],
  salesorder.services = req.body.services,
  salesorder.assets = req.body.assets,
  salesorder.property = req.body.property

  common.updatesaledetail(salesorder, req.body);

  return await salesorder.save(req)
}

async function converttobill(req, res, next) {
  var Id = req.params.Id;

  var salesorder = await Salesorder.findById(Id);
  req.body.customerid = (salesorder.customerid._id).toString(),
  req.body.onModel = salesorder.onModel,
  req.body.billdate = new Date(),
  req.body.duedate = new Date(),
  req.body.type = salesorder.type == 'pos' ? 'POS' : salesorder.type == 'asset' ? 'facilitybooking' : 'appointment',
  req.body.items = salesorder.items,
  req.body.services = salesorder.services,
  req.body.assets = salesorder.assets,
  req.body.amount = salesorder.amount,
  req.body.totalamount = salesorder.totalamount,
  req.body.taxamount = salesorder.taxamount,
  req.body.taxdetail = salesorder.taxdetail,
  req.body.discount = salesorder.discount,
  req.body.property = salesorder.property

  next();
}

async function remove(Id, req) {
  var salesorder = await Salesorder.findById(Id);
  salesorder.status = "deleted"
  return await salesorder.save(req);
}

async function filter(req) {
  return await Salesorder.getbyfilter(req)
}

async function findcount(params) {
  return await Salesorder.findcount(params)
}

async function exportdata(params) {
  return await Salesorder.exportdata(params)
}
