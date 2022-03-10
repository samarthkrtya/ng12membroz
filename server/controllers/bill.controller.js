const Joi = require('joi');
const Bill = require('../models/bill.model');
const Billpayment = require('../models/billpayment.model');
const Appointment = require('../models/appointment.model');
const billpayment = require('../controllers/billpayment.controller');
const Inventory = require('../models/inventory.model');
const Creditdebitnote = require('../models/creditdebitnote.model');
const Wallettxn = require('../models/wallettxn.model');
const common = require('../helpers/common');
import async from "async";

var ObjectID = require('mongodb').ObjectID;
const billSchema = Joi.object({
  billnumber: Joi.number().required(),
  prefix: Joi.string().required(),
  customerid: Joi.string().hex().required(),
  onModel: Joi.string().required(),
  billdate: Joi.date().required(),
  duedate: Joi.date(),
  remark: Joi.string(),
  amount: Joi.number().required(),
  totalamount: Joi.number().required(),
  balance: Joi.number(),
  discount: Joi.number(),
  deposit: Joi.number(),
  paidamount: Joi.number(),
  couponamount: Joi.number(),
  couponcode: Joi.string(),
  taxamount: Joi.number(),
  taxdetail: Joi.object(),
  items: Joi.array(),
  services: Joi.array(),
  assets: Joi.array(),
  packages: Joi.array(),
  tasks: Joi.array(),
  type: Joi.string(),
  attachments: Joi.array(),
  property: Joi.object()
})

module.exports = {
  insert,
  insertmultple,
  update,
  remove,
  filter,
  findcount,
  findbyId,
  findbyIds,
  exportdata,
  updatepayment,
  getnextdocnumber,
  getOAU,
  getbilldetail,
  findvalidgc,
  voidorder,
  additionalpayment,
  updateadditionalpayment
}

async function findbyId(Id) {
  return await Bill.findById(Id);
}

async function findbyIds(Ids) {
  return await Bill.find({ _id: { "$in": Ids } }).sort({ duedate: 1 });
}

 
async function findvalidgc(req, res){
  var query = [    
    {
      $unwind: {
        "path" : "$items"
      }
    },
    {
      $unwind: {
        "path" : "$items"
      }
    },
    {
      $match: {
        "status" : "Paid",
        "items.itemnumber" : req.body.itemnumber,
        "items.used" :  false,
        "items.valid": { $gte: new Date() }
      }
    }];
      
      var item = await Bill.aggregate(query);
      var data;
      if(item.length > 0){
        data = { _id : item[0]._id , items : item[0].items };
      }
      return data;
}


async function insertmultple(req) {
  var body = req.body;
  
  async.forEachSeries(body.bills, (bill, next) => {

    bill.billnumber = body.billnumber;
    bill.prefix  = body.prefix,
    common.updatesaledetail(bill, bill);
    Joi.validate(bill, billSchema, { abortEarly: false });   
    new Bill(bill).save(req);

    body.billnumber+=1;
    next();
  }, function () {
    return "DONE";
  }); 
}


async function insert(req) {
  var body = req.body;
  req.body.olditems = [];
  var bill = {
    billnumber: body.billnumber,
    prefix: body.prefix,
    customerid: body.customerid,
    onModel: body.onModel,
    billdate: body.billdate,
    duedate: body.duedate,
    couponamount: body.couponamount,    
    couponcode: body.couponcode,
    packages: body.packages,
    type: body.type,
    property: body.property,
    attachments: body.attachments
  }
  // CHECK DEPOSITS 
  var services = req.body.services;
  var deposits = 0, appointmentid;
  if (services && services.length > 0) {
    services.forEach((service) => {
      deposits += service.deposit ? service.deposit : 0;
      if (service.deposit > 0)
        appointmentid = service.appointmentid;
    });
  }
  //console.log("deposits", deposits)
  bill.deposit = deposits;    
  common.updatesaledetail(bill, body);
  await Joi.validate(bill, billSchema, { abortEarly: false });
  var bill = await new Bill(bill).save(req);    
  if (deposits > 0){
    req.body.paidamount = deposits;    
    var appointment = await Appointment.findById(appointmentid);
    await billpayment.insertdeposit(bill, appointment.deposits, req);
    return await getOAU(bill, body.customerid);
  } else {
    return await getOAU(bill, body.customerid);
  }
}

async function getOAU(bill, customerid) {

  var query = [{
    $match: {
      "status": { "$in": [ "Unpaid", "Partial"] }, 
      "customerid": ObjectID(customerid)
    }
  },
  {
    $group: {
      _id: "$customerid",
      "balance": { "$sum": "$balance" }
    }
  }];

  var balance = await Bill.aggregate(query);
  balance = balance.length > 0 ? balance[0].balance : 0;
  balance -= bill ? bill.balance : 0;
  if (!bill) bill = {}
  bill.outstandingamount = balance;
  return bill;
}

async function updatepayment(req) {
  var Id = req.body.billid;
  var paidamount = req.body.paidamount;
  if (Id && Id.length > 0) Id = Id[0]
  var bill = await Bill.findById(Id);
  bill._original = bill.toObject();
  bill.balance = bill.balance ? bill.balance : 0;
  if (paidamount >= bill.balance) {
    bill.balance = 0;
    bill.status = "Paid"
  }
  else {
    bill.balance -= paidamount
    bill.status = "Partial"
  }
  bill.paidamount += paidamount
  return await bill.save(req);

}

async function update(Id, req) {
  var body = req.body;
  var bill = await Bill.findById(Id);
  bill._original = bill.toObject();
  req.body.olditems = bill.items;
  bill.customerid = body.customerid,
  bill.onModel = body.onModel,
  bill.billdate = body.billdate,
  bill.duedate = body.duedate,
  bill.amount = body.amount,
  bill.totalamount = body.totalamount,
  bill.balance = body.balance ? body.balance : body.totalamount,
  bill.discount = body.discount,
  bill.paidamount = body.paidamount,
  bill.taxamount = body.taxamount,
  bill.packages = body.packages,
  bill.type = body.type,
  bill.attachments = body.attachments,
  bill.property = body.property

  bill.items.splice(0, bill.items.length)
  bill.services.splice(0, bill.services.length)
  bill.assets.splice(0, bill.assets.length)

  common.updatesaledetail(bill, body);

  return await bill.save(req)

}

async function remove(Id, req) {
  var bill = await Bill.findById(Id);
  if (bill.paidamount > 0) return bill;
  bill.status = "deleted"
  return await bill.save(req);
}

async function voidorder(Id, req) {
  try{
    var bill =  await Bill.findByIdAndUpdate(Id, { 'status' : "deleted" })
    await Billpayment.updateMany({billid : Id}, { 'status' : "deleted" })
    await  Wallettxn.updateMany({billid : Id}, { "status" : "void" })
    if(bill.items && bill.items.length > 0){
      bill.items.forEach(item => {
        if(item.item.enableinventory){
          Inventory.findOneAndUpdate({ itemid: item.item._id }, { $inc: { stock: item.quantity } }).then().catch((e) => console.log(e))
        }
      });
    }
    return bill;
  }catch(e){
    console.error(e);
  }
}

async function filter(params) {
  return await Bill.getbyfilter(params)
}

async function getnextdocnumber(req, res, next) {

  var branch = req.body.authkey.branchid;
  var prefix = "";

  if (DATABASETYPE == "branchwise") {
    var docformat = branch.docformat;
    prefix = docformat.bill ? docformat.bill["prefix"] : "JL";
  } else {
    var docformat = BILLFORMAT;
    if (docformat)
      prefix = docformat.bill ? docformat.bill["prefix"] : "JL";
  }

  Bill.getnextdocnumber(prefix, branch._id)
    .then((billnumber) => {
      req.body.billnumber = billnumber;
      req.body.prefix = prefix;
      if (!req.body.customerid) return res.json(prefix + "-" + billnumber);
      else next();
    })

}

async function findcount(req) {
  return await Bill.findcount(req)
}

async function exportdata(params) {
  return await Bill.exportdata(params)
}

async function getbilldetail(req, membershipitems) {
  //console.log("req.body", req.body)
  var items = req.body.items ? req.body.items : [];
  var services = req.body.services ? req.body.services : [];
  var assets = req.body.assets ? req.body.assets : [];
  var packages = req.body.packages ? req.body.packages : [];
  
  var taxamount = 0;
  var amount = 0;
  var totalamount = 0;
  var membershipdiscount = 0
  var discount = 0;
  var grandtotal = 0
  var billdetail = {}
  // console.log("services", services)
  // console.log("assets", assets)
  // console.log("items", items)
  items.forEach(item => {
    var membershipitem = membershipitems.find(membershipitem => {
      return membershipitem.type == "billitem" && membershipitem.itemid.toString() == item.itemid.toString()
    });

    let itemdiscount = 0, cost = 0;
    var taxes = item.sale.taxes;
    
    
    if (item.sale.rate) {
      totalamount += item.sale.rate * item.quantity;
      cost = item.sale.rate * item.quantity;
    }
    else {
      totalamount += item.cost * item.quantity;
      cost = item.cost * item.quantity;
    }

    item.sale.discount = item.sale.discount ? item.sale.discount : 0

    if (item.sale.discounttype && item.sale.discounttype=="Percentage"){
      itemdiscount += item.quantity * item.sale.discount * item.sale.rate / 100;
    }
    else {
      itemdiscount += item.quantity * item.sale.discount;
    }

    if (membershipitem && membershipitem.discount) {
      membershipdiscount += membershipitem.discount;
      itemdiscount += membershipitem.discount;
    }

    itemdiscount += item.coupondiscount ? (item.coupondiscount * item.quantity) : 0;
    
    item.discount = itemdiscount;
    discount += itemdiscount;

    amount += cost;
    if (taxes && cost > 0) {
      taxes.forEach(tax => {
        taxamount += (cost - itemdiscount) * tax.amount / 100
      });
    }
  });

  if(services && services.length > 0){
      services.forEach(item => {
        let itemdiscount = 0;
        var membershipitem = membershipitems.find(membershipitem => {
          return membershipitem.type == "service" &&  membershipitem.serviceid.toString() == item.refid.toString()
        });
        var taxes = item.taxes;
        item.quantity = item.quantity ? item.quantity : 1;
        totalamount += item.charges * item.quantity;
        var cost = item.charges * item.quantity;

        itemdiscount = item.discount;
        if (membershipitem && membershipitem.discount) {
          membershipdiscount += membershipitem.discount;
          itemdiscount += membershipitem.discount;
        }
        if(item.coupondiscount) itemdiscount += item.coupondiscount;

        item.discount = itemdiscount;
        discount += itemdiscount;

        amount += cost;
        if (taxes && cost > 0) {
          taxes.forEach(tax => {
            taxamount += (cost - itemdiscount) * tax.amount / 100
          });
        }
      });
  }

  if(assets && assets.length > 0){

    assets.forEach(item => {

      let itemdiscount = 0;
      var membershipitem = membershipitems.find(membershipitem => {
        return membershipitem.type == "asset" &&  membershipitem.serviceid.toString() == item.refid.toString()
      });
      var taxes = item.taxes;
      item.quantity = item.quantity ? item.quantity : 1;
      totalamount += item.charges * item.quantity;
      var cost = item.charges * item.quantity;

      itemdiscount = item.discount

      if (membershipitem && membershipitem.discount) {
        membershipdiscount += membershipitem.discount;
        itemdiscount += membershipitem.discount;
      }
      if(item.coupondiscount) itemdiscount += item.coupondiscount;

      item.discount = itemdiscount;
      discount += itemdiscount;

      amount += cost;
      if (taxes && cost > 0) {
        taxes.forEach(tax => {
          taxamount += (cost - itemdiscount) * tax.amount / 100
        });
      }
    });
  }

  if(packages && packages.length > 0){

    packages.forEach(item => { 
      var itemdiscount = 0
      var membershipitem = membershipitems.find(membershipitem => {
        return membershipitem.type == "package" &&  membershipitem.serviceid.toString() == item.refid.toString()
      });
      var taxes = item.taxes;
      item.quantity = item.quantity ? item.quantity : 1;
      item.discount = item.discount ? item.discount : 0;
      totalamount += item.rate * item.quantity;
      var cost = item.rate * item.quantity;

      itemdiscount = item.discount

      if (membershipitem && membershipitem.discount) {
        membershipdiscount += membershipitem.discount;
        itemdiscount += membershipitem.discount;
      }

      discount += item.discount;
      item.discount = itemdiscount;
      
      amount += cost;
      if (taxes && cost > 0) {
        taxes.forEach(tax => {
          taxamount += (cost - itemdiscount) * tax.amount / 100
        });
      }
    });
  } 

  grandtotal += amount;
  grandtotal += taxamount;
  grandtotal -= discount;
  grandtotal -= membershipdiscount;
  totalamount = grandtotal;
  billdetail = { taxamount: taxamount, grandtotal: grandtotal, billamount: totalamount, discount: discount, membershipdiscount: membershipdiscount }
  return billdetail;
}

async function additionalpayment(req,res,next){ 
  if(req.body.property.gifts && req.body.property.gifts.length > 0){

     async.forEachSeries(req.body.property.gifts, async (gift, next1) => {
 
        let bill = await Bill.findById(gift.billid);
        let item = bill.items.find(a=>a.itemnumber == gift.itemnumber);
        item['used'] = true;
        bill.items.splice(bill.items.findIndex(a=>a.gift == gift.itemnumber),1,item);
        await bill.save(req);

        next1();
    }, function () {
      return "DONE";
    });
  }

  if(req.body.property.creditnotes && req.body.property.creditnotes.creditnotesid){
    const data =  await Creditdebitnote.findByIdAndUpdate(req.body.property.creditnotes.creditnotesid , { "$set" : { "status" : "Paid" } });
  }
  next() 
}

async function updateadditionalpayment(req,res,next){
  if(req.body.giftcard){
        let bill = await Bill.findById(req.body.giftcard.giftcardid);
        let item = bill.items.find(a=>a.giftcard == req.body.giftcard.giftcard);
        item['used'] = false;
        bill.items.splice(bill.items.findIndex(a=>a.giftcard == req.body.giftcard.giftcard),1,item);
        await bill.save(req);
  }
  if(req.body.creditnotes){
    const data =  await Creditdebitnote.findByIdAndUpdate(req.body.creditnotes.creditnotesid , { "$set" : { "status" : "Unpaid" } });
  }
  res.json(req.body.billpayment);
}


