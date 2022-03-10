const Joi = require('joi');
const Purchaseorder = require('../models/purchaseorder.model');
const common = require('../helpers/common');

const purchaseorderSchema = Joi.object({
  ponumber: Joi.number().required(),
  prefix: Joi.string().required(),
  vendorid: Joi.string().hex().required(),
  orderdate: Joi.date().required(),
  shippingdate: Joi.date().allow(null),
  receivedate: Joi.date().allow(null),
  billingaddress: Joi.string().allow(null),
  shippingaddress: Joi.string().allow(null),
  items: Joi.array().required(),
  taxamount: Joi.number(),
  taxdetail: Joi.object(),
  amount: Joi.number().required(),
  totalamount: Joi.number().required(),
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
  converttopurchaseinvoice,
  exportdata
}

async function converttopurchaseinvoice(req, res, next) {

  var Id = req.params.Id;
   
  var purchaseorders = await Purchaseorder.findById(Id);
  req.body.vendorid = (purchaseorders.vendorid._id).toString(),
  req.body.invoicedate = new Date(),
  req.body.billingaddress = purchaseorders.billingaddress,
  req.body.items = purchaseorders.items,
  req.body.amount = purchaseorders.amount,
  req.body.totalamount = purchaseorders.totalamount,
  req.body.taxamount = purchaseorders.taxamount,
  req.body.taxdetail = purchaseorders.taxdetail,
  req.body.property = purchaseorders.property
  next();
}

async function findbyId(Id) {
  var params = {}
  params.formname = "purchaseorder";
  params.search = [
    { "searchfield": "_id", "searchvalue": Id, "datatype": "ObjectId", "criteria": "eq" }
  ];
  var purchaseorders = await Purchaseorder.getbyfilter(params);
  if (purchaseorders && purchaseorders.length == 1)
  return purchaseorders[0];
}

async function insert(req) {
  var body = req.body;
  var purchaseorder = {
    ponumber: body.ponumber,
    prefix: body.prefix,
    vendorid: body.vendorid,
    orderdate: body.orderdate,
    shippingdate: body.shippingdate,
    receivedate: body.receivedate,
    billingaddress: body.billingaddress,
    shippingaddress: body.shippingaddress,
    items: body.items,
    amount: body.amount ? body.amount : 0,
    totalamount: body.totalamount,
    taxamount: body.taxamount,
    attachments: body.attachments,
    property: body.property
  }

  common.updatepurchasedetail(purchaseorder, body);

  await Joi.validate(purchaseorder, purchaseorderSchema, { abortEarly: false });
  return await new Purchaseorder(purchaseorder).save(req);
}

async function update(Id, req) {

  var body = req.body;
  var purchaseorder = await Purchaseorder.findById(Id);
  purchaseorder._original = purchaseorder.toObject();
  purchaseorder.vendorid = body.vendorid,
  purchaseorder.orderdate = body.orderdate,
  purchaseorder.shippingdate = body.shippingdate,
  purchaseorder.receivedate = body.receivedate,
  purchaseorder.billingaddress = body.billingaddress,
  purchaseorder.shippingaddress = body.shippingaddress,
  purchaseorder.items = [],
  purchaseorder.amount = body.amount,
  purchaseorder.totalamount = body.totalamount,
  purchaseorder.taxamount = body.taxamount,
  purchaseorder.attachments = body.attachments,
  purchaseorder.property = body.property

  common.updatepurchasedetail(purchaseorder, body);

  return await purchaseorder.save(req);
}

async function remove(Id, req) {
  var purchaseorder = await Purchaseorder.findById(Id);
  purchaseorder.status = "deleted"
  return await purchaseorder.save(req);
}

async function filter(params) {
  return await Purchaseorder.getbyfilter(params)
}

async function getnextdocnumber(req, res, next) {

  var branch = req.body.authkey.branchid;
  var prefix = "";

  if (DATABASETYPE == "branchwise") {
    var docformat = branch.docformat;
    prefix = docformat.purchaseorder ? docformat.purchaseorder["prefix"] : "PO";
  } else {
    var docformat = BILLFORMAT;
    if (docformat)
      prefix = docformat.purchaseorder ? docformat.purchaseorder["prefix"] : "PO";
  }

  Purchaseorder.getnextdocnumber(prefix, branch._id)
    .then((ponumber) => {
      req.body.ponumber = ponumber;
      req.body.prefix = prefix;
      if (!req.body.vendorid) return res.json(prefix + "-" + ponumber);
      else next();
    })
    .catch((e) => next(e));

}

async function findcount(req) {
  return await Purchaseorder.findcount(req)
}

async function exportdata(params) {
  return await Purchaseorder.exportdata(params)
}

