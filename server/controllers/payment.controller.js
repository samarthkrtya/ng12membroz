const Joi = require('joi');
const Payment = require('../models/payment.model');
const Paymentschedule = require('../models/paymentschedule.model');

const paymentSchema = Joi.object({
  memberid: Joi.string().hex().required(),
  item: Joi.string().hex().required(),
  discount: Joi.number(),
  taxamount: Joi.number(),
  taxdetail: Joi.object(),
  amount: Joi.number().required(),
  totalamount: Joi.number().required(),
  paidamount: Joi.number().required(),
  mode: Joi.string(),
  receivedby: Joi.string().hex(),
  paymentdate: Joi.date().required(),
  prefix: Joi.string().required(),
  receiptnumber: Joi.number().required(),
  property: Joi.object()
})


module.exports = {
  insert,
  insertmultiple,
  multiplepayment,
  update,
  remove,
  filter,
  findcount,
  findbyId,
  exportdata,
  getnextdocnumber
}

async function findbyId(Id) {
  return await Payment.findById(Id);
}

async function insert(req) {

  var paidamount = req.body.paidamount;
  var taxdetail = {}, taxamount = 0;

  var payment = {
    memberid: req.body.memberid,
    item: req.body.item._id.toString(),
    mode: req.body.mode,
    receivedby: req.body.receivedby,
    paymentdate: req.body.paymentdate,
    prefix: req.body.prefix,
    receiptnumber: req.body.receiptnumber,
    property: req.body.property
  }

  var item = req.body.item;
  var taxes = item.paymentterms.taxes ? item.paymentterms.taxes : [];
  var discount = item.paymentterms.discount ? item.paymentterms.discount : 0;
  var amount = item.paymentterms.amount ? item.paymentterms.amount : 0

  var itemcost = amount - discount;

  if (taxes && taxes.length > 0) {
    var taxper = 0
    taxes.forEach(tax => {
      taxper += tax.amount / 100;
    })
    taxper += 1;

    var totalamount = round(taxper * itemcost, 2);
    amount = paidamount * itemcost / totalamount;

    taxes.forEach(tax => {

      var taxcalc = round(tax.amount * amount / 100, 2);
      taxamount += taxcalc;
      if (taxdetail.hasOwnProperty(tax.taxname)) {
        taxdetail[tax.taxname] += taxcalc;
      }
      else {
        taxdetail[tax.taxname] = taxcalc;
      }
      taxdetail[tax.taxname] = round(taxdetail[tax.taxname], 2);

    })
  }

  payment.amount = amount;
  payment.taxamount = taxamount;
  payment.discount = discount;
  payment.totalamount = itemcost + taxamount;
  payment.taxdetail = taxdetail;
  payment.paidamount = paidamount;

  payment = await Joi.validate(payment, paymentSchema, { abortEarly: false });
  payment = await new Payment(payment).save(req);
  var bill = await Paymentschedule.findById(payment.item);
  bill._original = bill.toObject();

  if (!bill.docnumber){
    bill.invoicenumber = req.body.invoicenumber;
    bill.prefix = req.body.invoiceprefix;
  }
  if (paidamount >= bill.balance) {
    bill.balance = 0;
    bill.status = "Paid"
  }
  else {
    bill.balance -= paidamount
    bill.status = "Partial"
  }
  bill.paidamount += parseFloat(paidamount);
  bill.save(req);
  return payment;

}


async function insertmultiple(req) {

  var items = req.body.items;
  var paidamount = req.body.paidamount;
  var payments = []
  var invoicenumber = req.body.invoicenumber;

  items.forEach((item) => {

    if (paidamount <= 0 || item.status == "Paid") return;

    var taxdetail = {}, taxamount = 0;

    var payment = {
      memberid: req.body.memberid,
      onModel: req.body.onModel ? req.body.onModel : 'Member',
      item: item._id.toString(),
      mode: req.body.mode,
      receivedby: req.body.receivedby,
      paymentdate: req.body.paymentdate,
      prefix: req.body.prefix,
      receiptnumber: req.body.receiptnumber,
      property: req.body.property
    }

    var taxes = item.paymentterms.taxes ? item.paymentterms.taxes : [];
    var discount = item.paymentterms.discount ? item.paymentterms.discount : 0;
    var amount = item.paymentterms.amount ? item.paymentterms.amount : 0

    var itemcost = amount - discount;

    if (taxes && taxes.length > 0) {
      var taxper = 0
      taxes.forEach(tax => {
        taxper += tax.amount / 100;
      })
      taxper += 1;

      var totalamount = round(taxper * itemcost, 2);
      if (paidamount <= totalamount) {
        var totalamount = round(taxper * itemcost, 2);
        amount = paidamount * itemcost / totalamount;
      }

      taxes.forEach(tax => {

        var taxcalc = round(tax.amount * amount / 100, 2);
        taxamount += taxcalc;
        if (taxdetail.hasOwnProperty(tax.taxname)) {
          taxdetail[tax.taxname] += taxcalc;
        }
        else {
          taxdetail[tax.taxname] = taxcalc;
        }
        taxdetail[tax.taxname] = round(taxdetail[tax.taxname], 2);

      })
    }

    payment.amount = amount;
    payment.taxamount = taxamount;
    payment.discount = discount;
    payment.totalamount = itemcost + taxamount;
    payment.taxdetail = taxdetail;

    if (payment.totalamount > paidamount)
    {
      payment.paidamount = paidamount;
    }
    else {
      payment.paidamount = payment.totalamount;
    }

    paidamount -= payment.paidamount;
    // console.log("items", item.paymentterms.amount)
    // console.log("payment.paidamount", payment.paidamount)
    // console.log("paidamount", paidamount)
    Payment(payment).save(req)
      .then((payment) =>{

        var paidamount = payment.paidamount;
        if (paidamount >= payment.item.balance) {
          item.balance = 0;
          item.status = "Paid"
        }
        else {
          item.balance -= paidamount
          item.status = "Partial"
        }

        if (!item.prefix && !item.invoicenumber){
          item.invoicenumber = invoicenumber;
          item.prefix = req.body.invoiceprefix;
          invoicenumber += 1;
        }
        item.paidamount += parseFloat(paidamount);
        item.save(req);
        payments.push(payment)
      })

  })
  return payments;
}

async function multiplepayment(req) {

  var items = req.body.items;
  var paidamount = req.body.paidamount;
  var payments = []
  var invoicenumber = req.body.invoicenumber;

  var paymentlist = req.body.payment;

  items.forEach((item) => {

    if (paidamount <= 0 || item.status == "Paid") return;

    var taxdetail = {}, taxamount = 0;

    var paymentObj = paymentlist.find(p=>p.paymentscheduleid == item._id.toString());
    
    var payment = {
      memberid: req.body.memberid,
      onModel: req.body.onModel ? req.body.onModel : 'Member',
      item: item._id.toString(),
      mode: paymentObj.mode,
      receivedby: req.body.receivedby,
      paymentdate: paymentObj.paymentdate,
      prefix: req.body.prefix,
      receiptnumber: req.body.receiptnumber,
      property: paymentObj.property
    }

    var taxes = item.paymentterms.taxes ? item.paymentterms.taxes : [];
    var discount = item.paymentterms.discount ? item.paymentterms.discount : 0;
    var amount = item.paymentterms.amount ? item.paymentterms.amount : 0

    var itemcost = amount - discount;

    if (taxes && taxes.length > 0) {
      var taxper = 0
      taxes.forEach(tax => {
        taxper += tax.amount / 100;
      })
      taxper += 1;

      var totalamount = round(taxper * itemcost, 2);
      if (paidamount <= totalamount) {
        var totalamount = round(taxper * itemcost, 2);
        amount = paidamount * itemcost / totalamount;
      }

      taxes.forEach(tax => {

        var taxcalc = round(tax.amount * amount / 100, 2);
        taxamount += taxcalc;
        if (taxdetail.hasOwnProperty(tax.taxname)) {
          taxdetail[tax.taxname] += taxcalc;
        }
        else {
          taxdetail[tax.taxname] = taxcalc;
        }
        taxdetail[tax.taxname] = round(taxdetail[tax.taxname], 2);

      })
    }

    payment.amount = amount;
    payment.taxamount = taxamount;
    payment.discount = discount;
    payment.totalamount = itemcost + taxamount;
    payment.taxdetail = taxdetail;

    if (payment.totalamount > paidamount)
    {
      payment.paidamount = paidamount;
    }
    else {
      payment.paidamount = payment.totalamount;
    }

    paidamount -= payment.paidamount;
    // console.log("items", item.paymentterms.amount)
    // console.log("payment.paidamount", payment.paidamount)
    // console.log("paidamount", paidamount)
    Payment(payment).save(req)
      .then((payment) =>{

        var paidamount = payment.paidamount;
        if (paidamount >= payment.item.balance) {
          item.balance = 0;
          item.status = "Paid"
        }
        else {
          item.balance -= paidamount
          item.status = "Partial"
        }

        if (!item.prefix && !item.invoicenumber){
          item.invoicenumber = invoicenumber;
          item.prefix = req.body.invoiceprefix;
          invoicenumber += 1;
        }
        item.paidamount += parseFloat(paidamount);
        item.save(req);
        payments.push(payment)
      })

  })
  return payments;
}



async function update(Id, req) {

  var payment = await Payment.findById(Id);
  payment._original = payment.toObject();

  var opayment = payment.paidamount;
  payment.paidamount = req.body.paidamount,
    payment.mode = req.body.mode,
    payment.receivedby = req.body.receivedby,
    payment.paymentdate = req.body.paymentdate
  payment.property = req.body.property


  var paymentterms = payment.item.paymentterms;
  var taxdetail = {}, taxamount = 0;
  if (paymentterms.taxes)
    var taxper = 0;
    paymentterms.taxes.forEach(tax => {
      taxper += tax.amount;
    });

  var taxper = (100 + taxper)/100;
  var amount = req.body.paidamount / taxper;

  paymentterms.taxes.forEach(tax => {
    taxdetail[tax.taxname] = (tax.amount * amount / 100).toFixed(2);
    taxamount += tax.amount * amount / 100;
  });

  payment.taxamount = taxamount,
    payment.amount = req.body.paidamount - taxamount,
    payment.totalamount = req.body.paidamount,
    payment.taxdetail = taxdetail
  await payment.save(req);

  var paymentschedule = await Paymentschedule.findById(payment.item._id)
  paymentschedule._original = paymentschedule.toObject();

  var extrapayment = payment.paidamount - opayment;

  if (extrapayment >= 0) {
    paymentschedule.balance -= extrapayment
    paymentschedule.paidamount += extrapayment
  }
  else {
    extrapayment = Math.abs(extrapayment)
    paymentschedule.balance += extrapayment
    paymentschedule.paidamount -= extrapayment
  }
  if (paymentschedule.balance <= 0) {
    paymentschedule.status = "Paid"
  }
  else
    paymentschedule.status = "Partial"

  paymentschedule.save(req).then()
  return payment;

}

async function getnextdocnumber(req, res, next) {

  var branch = req.body.authkey.branchid;
  var prefix = "";

  if (DATABASETYPE == "branchwise") {
    var docformat = branch.docformat;
    prefix = docformat.payment ? docformat.payment["prefix"] : "RE";
  } else {
    var docformat = BILLFORMAT;
    if (docformat)
      prefix = docformat.payment ? docformat.payment["prefix"] : "RE";
  }

  Payment.getnextdocnumber(prefix, branch._id)
    .then((receiptnumber) => {
      req.body.receiptnumber = receiptnumber;
      req.body.prefix = prefix;
      if (!req.body.memberid) return res.json(prefix + "-" + receiptnumber);
      else next();
    })

}

async function remove(Id, req) {
  var payment = await Payment.findByIdAndRemove(Id);

  var paymentschedule = await Paymentschedule.findById(payment.item._id)
  paymentschedule._original = paymentschedule.toObject();

  console.log(payment.paidamount, paymentschedule.paidamount)
  paymentschedule.balance += payment.paidamount
  paymentschedule.paidamount -= payment.paidamount

  if (paymentschedule.balance == paymentschedule.totalamount) {
    paymentschedule.status = "Unpaid"
  }
  else
    paymentschedule.status = "Partial"

  paymentschedule.save(req).then()
  return payment;
}

async function filter(params) {
  return await Payment.getbyfilter(params)
}

async function findcount(req) {
  return await Payment.findcount(req)
}

async function exportdata(params) {
  return await Payment.exportdata(params)
}
function round(number, decimalPlaces){
  const factorOfTen = Math.pow(10, decimalPlaces)
  var value = Math.round(number * factorOfTen) / factorOfTen
  return value;
}
