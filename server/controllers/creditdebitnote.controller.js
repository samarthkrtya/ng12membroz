const Joi = require('joi');
const Creditdebitnote = require('../models/creditdebitnote.model');
const Inventory = require('../models/inventory.model');
const common = require('../helpers/common');
var ObjectID = require('mongodb').ObjectID;
import async from "async";

const creditdebitnoteSchema = Joi.object({
  notesnumber: Joi.number().required(),
  prefix: Joi.string().required(),
  customerid: Joi.string().hex().required(),
  onModel: Joi.string().required(),
  billid: Joi.string().hex(),
  onModelBill: Joi.string(),
  notes: Joi.string().allow(null),
  reason: Joi.string(),
  date: Joi.date(),
  items: Joi.array(),
  adjustment: Joi.number(),
  amount: Joi.number(),
  taxamount: Joi.number(),
  taxdetail: Joi.object(),
  creditdebitdetail: Joi.object(),
  discount: Joi.number(),
  totalamount: Joi.number(),
  balance: Joi.number(),
  amountused: Joi.number(),
  attachments: Joi.array(),
  type: Joi.string(),
  property: Joi.object()
})


module.exports = {
  insert,
  update,
  remove,
  filter,
  getnextdocnumber,
  findcount,
  findbyId,
  findvalidcreditnotes,
  updatebillqty,
  exportdata
}

async function findbyId(Id) {
  return await Creditdebitnote.findById(Id);
}

async function insert(req) {

  var creditdebitnote = {
    notesnumber: req.body.notesnumber,
    prefix: req.body.prefix,
    customerid: req.body.customerid,
    onModel: req.body.onModel,
    billid: req.body.billid,
    onModelBill: req.body.onModelBill,
    notes: req.body.notes,
    reason: req.body.reason,
    date: req.body.date,
    items: req.body.items,
    adjustment: req.body.adjustment,
    amount: req.body.amount,
    discount: req.body.discount,
    taxamount: req.body.taxamount,
    creditdebitdetail: req.body.creditdebitdetail,
    totalamount: req.body.totalamount,
    balance: req.body.balance,
    amountused: req.body.amountused,
    attachments: req.body.attachments,
    type: req.body.type,
    property: req.body.property
  }
  if(req.body.type == 'bill' ){
    common.updatesaledetail(creditdebitnote, req.body);
  }else if(req.body.type == 'purchaseinvoice'){
    common.updatepurchasedetail(creditdebitnote, req.body);
  }
  creditdebitnote = await Joi.validate(creditdebitnote, creditdebitnoteSchema, { abortEarly: false });
  return await new Creditdebitnote(creditdebitnote).save(req);;
}

async function update(Id, req) {
  var creditdebitnote = await Creditdebitnote.findById(Id);
  creditdebitnote._original = creditdebitnote.toObject();
  creditdebitnote.customerid = req.body.customerid,
  creditdebitnote.onModelCustomer = req.body.onModelCustomer,
  creditdebitnote.billid = req.body.billid,
  creditdebitnote.onModelBill = req.body.onModelBill,
  creditdebitnote.notes = req.body.notes,
  creditdebitnote.reason = req.body.reason,
  creditdebitnote.date = req.body.date,
  creditdebitnote.items = req.body.items,
  creditdebitnote.adjustment = req.body.adjustment,
  creditdebitnote.amount = req.body.amount,
  creditdebitnote.discount = req.body.discount,
  creditdebitnote.taxamount = req.body.taxamount,
  creditdebitnote.creditdebitdetail = req.body.creditdebitdetail,
  creditdebitnote.totalamount = req.body.totalamount,
  creditdebitnote.balance = req.body.balance,
  creditdebitnote.amountused = req.body.amountused,
  creditdebitnote.attachments = req.body.attachments,
  creditdebitnote.type = req.body.type,
  creditdebitnote.property = req.body.property
  
  if(req.body.type == 'bill' ){
    common.updatesaledetail(creditdebitnote, req.body);
  }else if(req.body.type == 'purchaseinvoice'){
    common.updatepurchasedetail(creditdebitnote, req.body);
  }

  return await creditdebitnote.save(req);
}

async function remove(Id, req) {
  var creditdebitnote = await Creditdebitnote.findById(Id);
  creditdebitnote.status = "deleted"
  return await creditdebitnote.save(req);
}

async function filter(params) {
  return await Creditdebitnote.getbyfilter(params)
}

async function findvalidcreditnotes(req, res, next) {
  let query = [
    {
      $addFields : {
        "refunddate" : { 
          $dateFromString: { dateString : "$creditdebitdetail.validdate"}
       },
       "docnumber" : { $concat: [ "$prefix" , { "$toString" : "$notesnumber" } ] }
     }
    },    
    {
      $match: {
        "status" : "Unpaid",
        "customerid" : ObjectID(req.body.customerid),
        "docnumber" : req.body.document,
        "creditdebitdetail.method": "creditnotes",
        "refunddate": { $gte: new Date() }
      }
    }
  ];
  // console.log("query==>",query);
  var item = await Creditdebitnote.aggregate(query);
  var data;
  if(item.length > 0){
    data = { _id : item[0]._id , adjustment : item[0].adjustment , giftcard : item[0].prefix  + item[0].notesnumber };
  }
  return data;
}

async function getnextdocnumber(req, res, next) {

  var branch = req.body.authkey.branchid;
  var prefix = "";
  if (DATABASETYPE == "branchwise") {
    var docformat = branch.docformat;
    prefix = docformat.creditnote ? docformat.creditnote["prefix"] : "CDN";
  } else {
    var docformat = BILLFORMAT;
    if (docformat)
      prefix = docformat.creditnote ? docformat.creditnote["prefix"] : "CDN";
  }

  Creditdebitnote.getnextdocnumber(prefix, branch._id)
    .then((notesnumber) => {
      req.body.notesnumber = notesnumber;
      req.body.prefix = prefix;
      if (!req.body.customerid) return res.json(prefix + "-" + notesnumber);
      else next();
    })
    .catch((e) => next1(e));

}


async function updatebillqty(req, res, next) {
  let creditdebitnote = req.body;
  if(creditdebitnote.items  && creditdebitnote.items.length > 0 && creditdebitnote.creditdebitdetail && creditdebitnote.creditdebitdetail.method == 'creditnotes'){
    async.forEachSeries(creditdebitnote.items, async (item, next1) => {
        if(item.enableinventory){
          Inventory.findOneAndUpdate({ itemid: item.itemid }, { $inc: { stock: item.billquantity } }).then().catch((e) => console.log(e))
        }
       next1();
   }, function () {
     return "DONE";
   });
 }
 res.json(req.body.creditdebitnote);
}


async function findcount(req) {
  return await Creditdebitnote.findcount(req)
}

async function exportdata(params) {
  return await Creditdebitnote.exportdata(params)
}
 