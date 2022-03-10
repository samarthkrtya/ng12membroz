const Joi = require('joi');
const Billpayment = require('../models/billpayment.model');
const Appointment = require('../models/appointment.model');
const Facilitybooking = require('../models/facilitybooking.model');
const Bill = require('../models/bill.model');
const Prospect = require('../models/prospect.model');
const communicationCtrl = require('../controllers/communication.controller');
const common = require('../helpers/common');

var ObjectID = require('mongodb').ObjectID;

const billpaymentSchema = Joi.object({
  receiptnumber: Joi.number().required(),
  prefix: Joi.string().required(),
  billid: Joi.string().hex().required(),
  customerid: Joi.string().hex().required(),
  onModel: Joi.string().required(),
  paymentdate: Joi.date().required(),
  remark: Joi.string(),
  paidamount: Joi.number().required(),
  taxamount: Joi.number(),
  taxdetail: Joi.object(),
  rounding: Joi.number(), 
  walletamount: Joi.number(),
  couponamount: Joi.number(),
  couponcode: Joi.string().hex(),
  receivedby: Joi.string().hex(),
  sellby: Joi.string().hex(),
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
  getnextdocnumber,
  insertmultiple,
  insertdeposit
}

async function findbyId(Id) {
  return await Billpayment.findById(Id);
}

async function insertdeposit(bill, deposits, req) {

  bill._original = bill.toObject();
  var billpaidamount = 0;
  var balance = bill.balance - bill.deposit; // after deposit implements

  if (!req.body.walletamount) req.body.walletamount = 0
  if (!req.body.couponamount) req.body.couponamount = 0

  var paidamount = bill.deposit + req.body.couponamount + req.body.walletamount;

  if (paidamount >= balance){
    billpaidamount = balance;
  }  else {
    billpaidamount = paidamount
  }
  var branch = req.body.authkey.branchid;
  var prefix = "";

  if (DATABASETYPE == "branchwise") {
    var docformat = branch.docformat;
    prefix = docformat.billpayment ? docformat.billpayment["prefix"] : "BP";
  } else {
    var docformat = BILLFORMAT;
    if (docformat)
      prefix = docformat.billpayment ? docformat.billpayment["prefix"] : "BP";
  }

  var receiptnumber = await Billpayment.getnextdocnumber(prefix, branch._id)
  if (!deposits) deposits = {}
  deposits["deposits"] = true
  var body = req.body; 
  var billpayment = {
    receiptnumber: receiptnumber,
    prefix: prefix,
    billid: bill._id.toString(),
    customerid: body.customerid,
    onModel: body.onModel,
    paymentdate: deposits.paymentdate,
    paidamount: billpaidamount,
    couponcode: body.couponcode,
    couponamount: body.couponamount,
    walletamount: body.walletamount,
    receivedby: deposits.receivedby,
    sellby: body.sellby,
    rounding: body.rounding,
    property: deposits
  }
  //console.log("billpayment", billpayment)
  billpaymentdetail(bill, billpayment, billpaidamount);

  billpayment = await Joi.validate(billpayment, billpaymentSchema, { abortEarly: false });
  var billpayment = await new Billpayment(billpayment).save(req);
  bill.balance -= billpaidamount; // after deposit implements
  bill.paidamount += billpaidamount;
  if (bill.balance > 0) {
    bill.status = "Partial"
  }
  else {
    bill.status = "Paid"
  }
  
  bill = await bill.save(req);
  body.bill = bill;
  return billpayment;

}

async function insert(req) {
  var bill = await Bill.findById(req.body.billid);
  
  bill._original = bill.toObject();
  var billpaidamount = 0;
  let deposit = bill.deposit ? bill.deposit : 0;
  var balance = bill.balance; // before deposit implements  
  if (!req.body.walletamount) req.body.walletamount = 0
  if (!req.body.couponamount) req.body.couponamount = 0

  var paidamount = req.body.paidamount + req.body.couponamount + req.body.walletamount;
  var amountpaid = req.body.paidamount;

  if (paidamount >= balance){
    billpaidamount = balance;
    amountpaid = balance
  }  else {
    billpaidamount = paidamount
    amountpaid = req.body.paidamount;
  }

  var body = req.body;
  var billpayment = {
    receiptnumber: body.receiptnumber,
    prefix: body.prefix,
    billid: body.billid,
    customerid: body.customerid,
    onModel: body.onModel,
    paymentdate: body.paymentdate,
    paidamount: amountpaid,
    couponcode: body.couponcode,
    couponamount: body.couponamount,
    walletamount: body.walletamount,
    receivedby: body.receivedby,
    sellby: body.sellby,
    rounding: body.rounding,
    property: body.property
  }

  billpaymentdetail(bill, billpayment, billpaidamount);

  var outstandingamount = 0;
  outstandingamount = paidamount - billpaidamount;
  if (req.body.outstandingamount > 0 && outstandingamount > 0) {
    billpayment.property["outstandingamount"] = outstandingamount;
  }

  billpayment = await Joi.validate(billpayment, billpaymentSchema, { abortEarly: false });
  var billpayment = await new Billpayment(billpayment).save(req);

  bill.balance -= billpaidamount;// before deposit implements
  //bill.balance -= (billpaidamount + deposit); // after deposit implements
  bill.paidamount += billpaidamount;
  if (bill.balance > 0) {
    bill.status = "Partial"
  }
  else {
    bill.status = "Paid"
    updatebookingstatus(bill, req);
  }
  
  bill = await bill.save(req);

  req.body.bill = bill;

  if (req.body.outstandingamount > 0 && outstandingamount > 0) {
    findandupdateoutstanding(outstandingamount, bill._id, req);
  }

  return billpayment;

}

async function insertmultiple(req) {

  var items = req.body.items;
  var paidamount = req.body.paidamount;
  var payments = []
  var receiptnumber = req.body.receiptnumber;  
  items.forEach((item) => {
    
    if (paidamount <= 0 || item.status == "Paid") return;
 
    var payment = {
      customerid: req.body.customerid,
      onModel: req.body.onModel,
      billid: item._id.toString(),
      mode: req.body.mode,
      receivedby: req.body.receivedby,
      sellby: req.body.sellby,
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
    Billpayment(payment).save(req)
      .then((payment) =>{

        var paidamount = payment.paidamount;
        if (paidamount >= payment.billid.balance) {
          item.balance = 0;
          item.status = "Paid"
        }
        else {
          item.balance -= paidamount
          item.status = "Partial"
        }

        item.paidamount += parseFloat(paidamount);
        item.save(req);
        updatebookingstatus(item, req);
        payments.push(payment);
      });
      receiptnumber += 1;
  })
  return payments;
}

async function updatebookingstatus(bill, req) {

  if (bill.services && bill.services.length > 0) {
    bill.services.forEach((appointment) => {
      Appointment.findByIdAndUpdate(appointment.appointmentid, { "$set": { status: "checkout" } }).then()
    })
  }
  if (bill.assets && bill.assets.length > 0) {
    bill.assets.forEach((booking) => {
      Facilitybooking.findByIdAndUpdate(booking.bookingid, { "$set": { status: "checkout" } }).then()
    })
  }
  if (bill.items && bill.items.length > 0) {
    bill.items.forEach((gc) => {
      if (gc.to){        
        gc['fromname']= bill.customerid.fullname;        
        var branch = req.body.authkey.branchid;
        var content = common.regexrep(gc.item.property.content, gc, null, branch);
        var message = {
          content: content,
          to: [gc.to],
          subject: "Gift Voucher",
        }
        req.body.message = message;
        req.body.messagetype = "EMAIL";
        communicationCtrl.sendcommunication(req, null, "GC");
      }
    })
  }

  if (bill.onModel=="Prospect"){
    Prospect.findByIdAndUpdate(bill.customerid, { "$set": { stage: "billed" } }).then()
  }

}

async function findandupdateoutstanding(outstandingamount, billid, req) {

  var query = {
    "status": { "$ne": "Paid" },
    "customerid": ObjectID(req.body.customerid),
    "_id": { "$ne": billid }
  };
  var outstandingbills = await Bill.find(query).sort({ "billdate": 1 });
  var paidamount = 0;
  var status;

  for (var i = 0; i < outstandingbills.length; i++)
  {
    var outstandingbill = outstandingbills[i];
    if (outstandingamount <=0) return;

    if (outstandingamount >= outstandingbill.balance) {
      paidamount = outstandingbill.balance
      outstandingbill.balance = 0;
      status = "Paid"
    }
    else {
      paidamount = outstandingamount;
      outstandingbill.balance -= outstandingamount;
    }

    var body = req.body;

    var billpayment = {
      receiptnumber: body.receiptnumber,
      prefix: body.prefix,
      billid: outstandingbill._id,
      customerid: body.customerid,
      onModel: body.onModel,
      paymentdate: body.paymentdate,
      receivedby: body.receivedby,
      status: "Paid",
      property: body.property

    }
    billpaymentdetail(outstandingbill, billpayment, paidamount);
    if (outstandingbill.balance>0) status = "Partial"
    else status= "Paid"
    
    paidamount += outstandingbill.paidamount;
    await new Billpayment(billpayment).save(req)
    await Bill.findByIdAndUpdate(outstandingbill._id, { "$set": { status: status, balance: outstandingbill.balance, paidamount: paidamount } })
    outstandingamount -= paidamount;

  }

  return;

}


async function update(Id, req) {

  var body = req.body;
  var billpayment = await Billpayment.findById(Id);
  var netpaid = billpayment.paidamount;

  billpayment._original = billpayment.toObject();
  billpayment.billid = body.billid,
  billpayment.customerid = body.customerid,
  billpayment.onModel = body.onModel,
  billpayment.paymentdate = body.paymentdate,
  billpayment.amount = body.amount,
  billpayment.totalamount = body.totalamount,
  billpayment.discount = body.discount,
  billpayment.taxamount = body.taxamount,
  billpayment.taxdetail = body.taxdetail,
  billpayment.receivedby = body.receivedby,
  billpayment.sellby = body.sellby,
  billpayment.attachments = body.attachments,
  billpayment.property = body.property

  var bill = await Bill.findById(req.body.billid);
  bill._original = bill.toObject();
  var billpaidamount = 0;
  var balance = bill.balance;

  if (!req.body.walletamount) req.body.walletamount = 0
  if (!req.body.couponamount) req.body.couponamount = 0

  var paidamount = req.body.paidamount + req.body.couponamount + req.body.walletamount;
  var amountpaid = req.body.paidamount;

  if (paidamount >= balance){
    billpaidamount = balance;
    amountpaid = balance
  }
  else {
    billpaidamount = paidamount;
    amountpaid = req.body.paidamount;
  }

  billpayment.paidamount = billpaidamount;
  billpaymentdetail(bill, billpayment, billpaidamount);

  await billpayment.save(req);
  netpaid = billpaidamount - netpaid;

  bill.balance -= netpaid;
  bill.paidamount += netpaid
  if (bill.balance > 0) {
    bill.status = "Partial"
  }
  else {
    bill.status = "Paid"
  }

  await bill.save(req);

  return billpayment;

}

async function remove(Id, req) {
  var billpayment = await Billpayment.findById(Id);
  billpayment.status = "deleted"
  await billpayment.save(req);

  var bill = await Bill.findById(billpayment.billid);
  bill._original = bill.toObject();

  bill.balance += billpayment.paidamount;
  bill.paidamount -= billpayment.paidamount
  if (bill.balance > 0) {
    bill.status = "Partial"
  }
  else {
    bill.status = "Paid"
  }

  await bill.save(req);
  return billpayment;

}

async function filter(params) {
  return await Billpayment.getbyfilter(params)
}

async function getnextdocnumber(req, res, next) {

  var branch = req.body.authkey.branchid;
  var prefix = "";

  if (DATABASETYPE == "branchwise") {
    var docformat = branch.docformat;
    prefix = docformat.billpayment ? docformat.billpayment["prefix"] : "BP";
  } else {
    var docformat = BILLFORMAT;
    if (docformat)
      prefix = docformat.billpayment ? docformat.billpayment["prefix"] : "BP";
  }

  Billpayment.getnextdocnumber(prefix, branch._id)
    .then((receiptnumber) => {
      req.body.receiptnumber = receiptnumber;
      req.body.prefix = prefix;
      if (!req.body.customerid) return res.json(prefix + "-" + receiptnumber);
      else next();
    })

}

async function findcount(req) {
  return await Billpayment.findcount(req)
}

async function exportdata(params) {
  return await Billpayment.exportdata(params)
}

function round(number, decimalPlaces){
  const factorOfTen = Math.pow(10, decimalPlaces)
  var value = Math.round(number * factorOfTen) / factorOfTen
  return value;
}

function billpaymentdetail(bill, billpayment, paidamount) {

  var taxdetail = {};
  var taxtotal = 0
  var billtotal = bill.totalamount;

  bill.items.forEach(item => {

    var taxes = item.item.sale.taxes;

    var taxamount = 0
    if (taxes && taxes.length > 0) {
      var taxper = 0
      taxes.forEach(tax => {
        taxper += tax.amount / 100;
      })
      taxper += 1;
      var amount = (paidamount * item.totalcost / billtotal) / taxper;

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
      taxtotal += taxamount;
    }
  })

  bill.services.forEach(item => {

    var taxes = item.taxes;
    item.quantity = 1;

    var taxamount = 0
    if (taxes && taxes.length > 0) {
      var taxper = 0
      taxes.forEach(tax => {
        taxper += tax.amount / 100;
      })
      taxper += 1;
      // console.log("item.totalcost", item.totalcost, paidamount, billtotal, taxper);
      var amount = (paidamount * item.totalcost / billtotal) / taxper;
      taxes.forEach(tax => {
        // console.log("amount", amount, tax.amount)
        var taxcalc = round(tax.amount * amount / 100, 2)
        taxamount += taxcalc
        if (taxdetail.hasOwnProperty(tax.taxname)) {
          taxdetail[tax.taxname] += taxcalc
        }
        else {
          taxdetail[tax.taxname] = taxcalc
        }
        taxdetail[tax.taxname] = round(taxdetail[tax.taxname], 2);
      })
    }
    taxtotal += taxamount
  })

  bill.assets.forEach(item => {

    var taxes = item.taxes;

    var taxamount = 0
    if (taxes && taxes.length > 0) {
      var taxper = 0
      taxes.forEach(tax => {
        taxper += tax.amount / 100;
      })
      taxper += 1;
      var amount = (paidamount * item.totalcost / billtotal) / taxper;

      taxes.forEach(tax => {
        var taxcalc = round(tax.amount * amount / 100, 2);
        taxamount += taxcalc;
        if (taxdetail.hasOwnProperty(tax.taxname)) {
          taxdetail[tax.taxname] += taxcalc
        }
        else {
          taxdetail[tax.taxname] = taxcalc
        }
        taxdetail[tax.taxname] = round(taxdetail[tax.taxname], 2);
      })
    }

    taxtotal += taxamount;
  })

  billpayment.taxamount = taxtotal
  billpayment.taxdetail = taxdetail
  billpayment.paidamount = paidamount

}
