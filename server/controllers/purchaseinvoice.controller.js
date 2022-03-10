const Joi = require('joi');
const Purchaseinvoice = require('../models/purchaseinvoice.model');
const common = require('../helpers/common');

const purchaseinvoiceSchema = Joi.object({
  pinumber: Joi.number().required(),
  prefix: Joi.string().required(),
  vendorid: Joi.string().hex().required(),
  invoicedate: Joi.date().required(),
  duedate: Joi.date(),
  billingaddress: Joi.string().allow(null),
  items: Joi.array().required(),
  balance: Joi.number(),
  paidamount: Joi.number(),
  taxamount: Joi.number(),
  taxdetail: Joi.object(),
  amount: Joi.number().required(),
  totalamount: Joi.number().required(),
  discount: Joi.number(),
  attachments: Joi.array(),
  property: Joi.object()
})


module.exports = {
  insert,
  update,
  remove,
  filter,
  findcount,
  findbyId,
  findbyIds,
  exportdata,
  getnextdocnumber,
  getinvoicedetail
}

async function findbyId(Id) {
  return await Purchaseinvoice.findById(Id);
}

async function findbyIds(Ids) {
  return await Purchaseinvoice.find({ _id: { "$in": Ids } }).sort({ invoicedate: 1 });
}


async function insert(req) {
  var body = req.body;

  var purchaseinvoice = {
    pinumber: body.pinumber,
    prefix: body.prefix,
    vendorid: body.vendorid,
    invoicedate: body.invoicedate,
    duedate: body.duedate,
    billingaddress: body.billingaddress,
    items: body.items,
    amount: body.amount?body.amount:0,
    totalamount: body.totalamount,
    balance: body.balance ? body.balance : body.totalamount,
    discount: body.discount,
    paidamount: body.paidamount,
    taxamount: body.taxamount,
    property: body.property,
    attachments: body.attachments
  }

  common.updatepurchasedetail(purchaseinvoice, body);

  await Joi.validate(purchaseinvoice, purchaseinvoiceSchema, { abortEarly: false });
  return await new Purchaseinvoice(purchaseinvoice).save(req);
}

async function update(Id, req) {
  var body = req.body;

  var purchaseinvoice = await Purchaseinvoice.findById(Id);
  purchaseinvoice._original = purchaseinvoice.toObject();
  req.body.olditems = purchaseinvoice.items;
  purchaseinvoice.vendorid = body.vendorid,
  purchaseinvoice.invoicedate = body.invoicedate,
  purchaseinvoice.duedate = body.duedate,
  purchaseinvoice.billingaddress = body.billingaddress,
  purchaseinvoice.items = [],
  purchaseinvoice.balance = body.balance,
  purchaseinvoice.paidamount = body.paidamount,
  purchaseinvoice.amount = body.amount,
  purchaseinvoice.totalamount = body.totalamount,
  purchaseinvoice.balance = body.balance ? body.balance : body.totalamount,
  purchaseinvoice.discount = body.discount,
  purchaseinvoice.taxamount = body.taxamount,
  purchaseinvoice.attachments = body.attachments,
  purchaseinvoice.property = body.property

  common.updatepurchasedetail(purchaseinvoice, body);

  return await purchaseinvoice.save(req);

}

async function remove(Id, req) {
  var purchaseinvoice = await Purchaseinvoice.findById(Id);
  purchaseinvoice.status = "deleted"
  return await purchaseinvoice.save(req);
}

async function filter(params) {
  return await Purchaseinvoice.getbyfilter(params)
}

async function getnextdocnumber(req, res, next) {

  var branch = req.body.authkey.branchid;
  var prefix = "";

  if (DATABASETYPE == "branchwise") {
    var docformat = branch.docformat;
    prefix = docformat.purchaseinvoice ? docformat.purchaseinvoice["prefix"] : "PI";
  } else {
    var docformat = BILLFORMAT;
    if (docformat)
      prefix = docformat.purchaseinvoice ? docformat.purchaseinvoice["prefix"] : "PI";
  }

  Purchaseinvoice.getnextdocnumber(prefix, branch._id)
    .then((pinumber) => {
      req.body.pinumber = pinumber;
      req.body.prefix = prefix;
      if (!req.body.vendorid) return res.json(prefix + "-" + pinumber);
      else next();
    })
    .catch((e) => next1(e));

}

async function findcount(req) {
  return await Purchaseinvoice.findcount(req)
}

async function exportdata(params) {
  return await Purchaseinvoice.exportdata(params)
}


async function getinvoicedetail(req) {

  var items = req.body.items;
  var taxamount = 0;
  var amount = 0;
  var totalamount = 0;
  var grandtotal = 0
  var billdetail = {}

  items.forEach(ele => {

    var cost = ele.item.purchase.rate * ele.quantity;
    var taxes = ele.item.purchase.taxes;
    totalamount += ele.item.purchase.rate * ele.quantity;
    amount += cost;

    if (taxes && cost > 0) {
      taxes.forEach(tax => {
        taxamount += cost * tax.amount / 100
      });
    }
  });

  grandtotal += amount;
  grandtotal += taxamount;

  billdetail = { taxamount: taxamount, grandtotal: grandtotal, billamount: totalamount }

  return billdetail;
}

