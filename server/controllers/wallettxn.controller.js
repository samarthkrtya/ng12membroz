const Joi = require('joi');
const Wallettxn = require('../models/wallettxn.model');
const Memberwalletview = require('../views/memberwallet.view');
const Customerwalletview = require('../views/customerwallet.view');
const Userwalletview = require('../views/userwallet.view');

const wallettxnSchema = Joi.object({
  txnref: Joi.string().allow(''),
  cardnumber: Joi.string().allow(''),
  txntype: Joi.string().required(),
  value: Joi.number().required(),
  property: Joi.object(),
  customerid: Joi.string().hex().required(),
  onModel: Joi.string().required(),
  billid: Joi.string().hex(),
  txndate: Joi.date().required(),
})


module.exports = {
  insert,
  update,
  patch,
  remove,
  filter,
  findcount,
  findbyId,
  exportdata,
}

async function findbyId(Id) {
  return await Wallettxn.findById(Id);
}

async function insert(req) {
  
  var wallettxn = {
    property: req.body.property,
    txntype: req.body.txntype,
    txnref: req.body.txnref,
    cardnumber: req.body.cardnumber,
    value: req.body.value,
    customerid: req.body.customerid,
    billid: req.body.billid,
    onModel: req.body.onModel,
    txndate: req.body.txndate
  }
  await Joi.validate(wallettxn, wallettxnSchema, { abortEarly: false });
  
  if (wallettxn.txntype == "Dr"){
    
    req.body.search = [ { "searchfield": "_id",  "searchvalue": req.body.customerid,  "datatype": "ObjectId", "criteria":"eq" }]
    req.body.formname = "wallettxn"
    var result;
    if (req.body.onModel == "User"){
      result = await Userwalletview.getfilterview(req.body)
    }
    else if (req.body.onModel == "Member") {
      result = await Memberwalletview.getfilterview(req.body)
    }
    else if (req.body.onModel == "Prospect") {
      result = await Customerwalletview.getfilterview(req.body)
    }

    if (result && result.length > 0){
      var wallet = result[0].wallet;
      if (wallet && wallet.balance > 0) {
        return await new Wallettxn(wallettxn).save(req);
      }
      else {
        return null;
      }
    }
  }
  else {
    return await new Wallettxn(wallettxn).save(req);
  }

}

async function update(Id, req) {
  var wallettxn = await Wallettxn.findById(Id);
  wallettxn.property = req.body.property
  return await wallettxn.save(req);
}

async function patch(Id, req) {
  var wallettxn = await Wallettxn.findById(Id);
  if (req.body.attachments) wallettxn.attachments = req.body.attachments;
  if (req.body.profilepic) wallettxn.profilepic = req.body.profilepic;
  return await wallettxn.save(req);
}

async function remove(Id, req) {
  var wallettxn = await Wallettxn.findById(Id);
  wallettxn.status = "deleted"
  return await wallettxn.save(req);
}

async function filter(params) {
  return await Wallettxn.getbyfilter(params)
}

async function findcount(req) {
  return await Wallettxn.findcount(req)
}

async function exportdata(params) {
  return await Wallettxn.exportdata(params)
}
