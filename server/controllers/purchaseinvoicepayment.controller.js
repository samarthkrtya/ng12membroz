const Joi = require('joi');
const Purchaseinvoicepayment = require('../models/purchaseinvoicepayment.model');

const purchaseinvoicepaymentSchema = Joi.object({
  receiptnumber: Joi.number().required(),
  prefix: Joi.string(),
  vendorid: Joi.string().hex().required(),
  purchasebill: Joi.string().hex().required(),
  paymentdate: Joi.date().required(),
  paidamount: Joi.number().required(),
  taxamount: Joi.number(),
  taxdetail: Joi.object(),
  attachments: Joi.array(),
  property: Joi.object()
})


module.exports = {
  insert,
  insertmultiple,
  update,
  remove,
  filter,
  findcount,
  findbyId,
  exportdata,
  getnextdocnumber
}

async function findbyId(Id) {
  var params = {}
  params.formname = "purchaseinvoicepayment";
  params.search = [
    { "searchfield": "_id", "searchvalue": Id, "datatype": "ObjectId", "criteria": "eq" }
  ];
  var purchaseinvoicepayments = await Purchaseinvoicepayment.getbyfilter(params);
  if (purchaseinvoicepayments && purchaseinvoicepayments.length == 1)
  return purchaseinvoicepayments[0];
}

async function insert(req) {
  var body = req.body;
  var purchaseinvoicepayment = {
    receiptnumber: body.receiptnumber,
    prefix: body.prefix,
    vendorid: body.vendorid,
    purchasebill: body.purchasebill,
    paymentdate: body.paymentdate,
    paidamount: body.paidamount,
    taxamount: body.taxamount,
    taxdetail: body.taxdetail,
    property: body.property,
    attachments: body.attachments
  }
  await Joi.validate(purchaseinvoicepayment, purchaseinvoicepaymentSchema, { abortEarly: false });
  return await new Purchaseinvoicepayment(purchaseinvoicepayment).save(req);
}

async function insertmultiple(req) {

  var items = req.body.items;
  var paidamount = req.body.paidamount;
  var payments = []
  var receiptnumber = req.body.receiptnumber;
  // console.log("items", req.body)
  // return;
  items.forEach((item) => {

    if (paidamount <= 0 || item.status == "Paid") return;

    var payment = {
      vendorid: req.body.vendorid,
      purchasebill: item._id.toString(),
      mode: req.body.mode,
      receivedby: req.body.receivedby,
      paymentdate: req.body.paymentdate,
      prefix: req.body.prefix,
      receiptnumber: receiptnumber,
      property: req.body.property
    }

    payment.amount = item.amount;
    payment.taxamount = item.taxamount;
    payment.discount = item.discount;
    payment.totalamount = item.totalamount;
    payment.taxdetail = item.taxdetail;

    if (payment.totalamount > paidamount)
    {
      payment.paidamount = paidamount;
    }
    else {
      payment.paidamount = payment.totalamount;
    }

    paidamount -= payment.paidamount;

    Purchaseinvoicepayment(payment).save(req)
      .then((payment) => {
        var paidamount = payment.paidamount;
        if (paidamount >= payment.purchasebill.balance) {
          item.balance = 0;
          item.status = "Paid"
        }
        else {
          item.balance -= paidamount
          item.status = "Partial"
        }

        item.paidamount += parseFloat(paidamount);
        item.save(req);
        payments.push(payment)
      })
      receiptnumber += 1;
  })
  return payments;
}

async function update(Id, req) {

  var body = req.body;
  var purchaseinvoicepayment = await Purchaseinvoicepayment.findById(Id);
  purchaseinvoicepayment._original = purchaseinvoicepayment.toObject();
  purchaseinvoicepayment.vendorid = body.vendorid,
  purchaseinvoicepayment.purchasebill = body.purchasebill,
  purchaseinvoicepayment.paymentdate = body.paymentdate,
  purchaseinvoicepayment.paidamount = body.paidamount,
  purchaseinvoicepayment.taxamount = body.taxamount,
  purchaseinvoicepayment.taxdetail = body.taxdetail,
  purchaseinvoicepayment.attachments = body.attachments
  purchaseinvoicepayment.property = body.property
  return await purchaseinvoicepayment.save(req);

}

async function remove(Id, req) {
  var purchaseinvoicepayment = await Purchaseinvoicepayment.findById(Id);
  purchaseinvoicepayment.status = "deleted"
  return await purchaseinvoicepayment.save(req);
}

async function filter(params) {
  return await Purchaseinvoicepayment.getbyfilter(params)
}

async function getnextdocnumber(req, res, next) {

  var branch = req.body.authkey.branchid;
  var prefix = "";

  if (DATABASETYPE == "branchwise") {
    var docformat = branch.docformat;
    prefix = docformat.popayment ? docformat.popayment["prefix"] : "PI";
  } else {
    var docformat = BILLFORMAT;
    if (docformat)
      prefix = docformat.popayment ? docformat.popayment["prefix"] : "PI";
  }

  Purchaseinvoicepayment.getnextdocnumber(prefix, branch._id)
    .then((receiptnumber) => {
      req.body.receiptnumber = receiptnumber;
      req.body.prefix = prefix;
      if (!req.body.vendorid) return res.json(prefix + "-" + receiptnumber);
      else next();
    })
    .catch((e) => next1(e));

}

async function findcount(req) {
  return await Purchaseinvoicepayment.findcount(req)
}

async function exportdata(params) {
  return await Purchaseinvoicepayment.exportdata(params)
}
