const Joi = require('joi');
const Cashbackterm = require('../models/cashbackterm.model');
const Wallettxn = require('../models/wallettxn.model');

const cashbacktermSchema = Joi.object({
  category: Joi.string().hex().required(),
  maxamount: Joi.number().allow(null),
  minamount: Joi.number().allow(null),
  cashbackmethod: Joi.string(),
  cashbackper: Joi.number().allow(null),
  cashbackamount: Joi.number().allow(null),
  member: Joi.number(),
  nonmember: Joi.number(),
  categorytype: Joi.string(),
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
  addcashback
}

async function findbyId(Id) {
  return await Cashbackterm.findById(Id);
}

async function insert(req) {
  
  var cashbackterm = {
    category: req.body.category,
    maxamount: req.body.maxamount,
    minamount: req.body.minamount,
    cashbackmethod: req.body.cashbackmethod,
    cashbackper: req.body.cashbackper,
    member: req.body.member,
    nonmember: req.body.nonmember,
    categorytype: req.body.categorytype,
    property: req.body.property,
  }
  await Joi.validate(cashbackterm, cashbacktermSchema, { abortEarly: false });
  return await new Cashbackterm(cashbackterm).save(req);
}

async function update(Id, req) {
  var cashbackterm = await Cashbackterm.findById(Id);
  cashbackterm._original = cashbackterm.toObject();
  cashbackterm.category = req.body.category,
  cashbackterm.maxamount = req.body.maxamount,
  cashbackterm.minamount = req.body.minamount,
  cashbackterm.member = req.body.member,
  cashbackterm.nonmember = req.body.nonmember,
  cashbackterm.categorytype = req.body.categorytype,
  cashbackterm.cashbackmethod = req.body.cashbackmethod,
  cashbackterm.cashbackper = req.body.cashbackper,
  cashbackterm.cashbackamount = req.body.cashbackamount,
  cashbackterm.property = req.body.property
  return await cashbackterm.save(req);
}

async function remove(Id, req) {
  var cashbackterm = await Cashbackterm.findById(Id);
  cashbackterm.status = "deleted"
  return await cashbackterm.save(req);
}

async function filter(params) {
  return await Cashbackterm.getbyfilter(params)
}

async function findcount(req) {
  return await Cashbackterm.findcount(req)
}

async function exportdata(params) {
  return await Cashbackterm.exportdata(params)
}

function addcashback(req, res, next) {

  var branch = req.body.authkey.branchid;
  var branchid = req.body.branchid ? req.body.branchid : req.body.authkey.branchid._id ? req.body.authkey.branchid._id : null;
  var bill = req.body.bill;

  var paidamountprop = req.body.paidamount / bill.totalamount;
  
  if (branch.loyalitysettings && !branch.loyalitysettings.enable)
  {
    res.json(req.body.billpayment);
    return;
  }
  else if (branch.loyalitysettings && branch.loyalitysettings.enable) {
    var cashbackamount = 0;
    if (bill.onModel == "Member" && branch.loyalitysettings.memberpoints > 0) {
      cashbackamount = req.body.paidamount * branch.loyalitysettings.memberpoints / 100 * paidamountprop;
    }
    else if (bill.onModel == "Prospect" && branch.loyalitysettings.nonmemberpoints > 0) {
      cashbackamount = req.body.paidamount * branch.loyalitysettings.nonmemberpoints / 100 * paidamountprop;
    }

    if (cashbackamount > 0) {
      const wallettxn = new Wallettxn({
        txntype: "Cr",
        txnref: "Cashback on purchase of bill #" + bill.docnumber,
        customerid: bill.customerid,
        onModel: bill.onModel,
        wallettype: "General",
        txndate: new Date(),
        value: cashbackamount
      });
      
      wallettxn.save(req)
        .then(() => {
        })
    }
  }

  var items = bill.items ? bill.items : [];

  items.forEach(item => {

    if (item.item && item.item.category) {
      Cashbackterm.findOne({ "category": item.item.category._id, "branchid": branchid, status: "active" })
        .then((cashback) => {

          if (cashback) {
            // console.log("cashback 1", cashback)
            var value = item.totalcost
            var cashbackamount = 0;
            if (bill.onModel == "Member") {
              cashbackamount = value * cashback.member /  100 * paidamountprop;
            }
            else {
              cashbackamount = value * cashback.nonmember /  100 * paidamountprop;
            }

            const wallettxn = new Wallettxn({
              txntype: "Cr",
              txnref: "Cashback on purchase of " + item.item.itemname + " bill #" + bill.docnumber,
              customerid: bill.customerid,
              onModel: bill.onModel,
              wallettype: "General",
              txndate: new Date(),
              value: cashbackamount
            });

            wallettxn.save(req)
              .then(() => {
              })

          }
        })
    }

  })

  var services = bill.services ? bill.services : [];
  services.forEach(item => {

    Cashbackterm.findOne({ "category": item.refid.category, "branchid": branchid, status: "active" })
      .then((cashback) => {
        
        if (cashback) {
          // console.log("cashback 2", cashback)
          var value = item.totalcost;
          var cashbackamount = 0;
          if (bill.onModel == "Member") {
            cashbackamount = value * cashback.member /  100 * paidamountprop;
          }
          else {
            cashbackamount = value * cashback.nonmember / 100 * paidamountprop;
          }

          const wallettxn = new Wallettxn({
            txntype: "Cr",
            txnref: "Cashback on " + item.refid.title + " bill #" + bill.docnumber,
            customerid: bill.customerid,
            onModel: bill.onModel,
            wallettype: "General",
            txndate: new Date(),
            value: cashbackamount
          });

          wallettxn.save(req)
            .then(() => {
            })
            .catch(err=> console.log(err))

        }
      })

  });

  var assets = bill.assets ? bill.assets : [];
  assets.forEach(item => {

    Cashbackterm.findOne({ "category": item.refid.category, "branchid": branchid, status: "active" })
      .then((cashback) => {
        if (cashback) {
          var value = item.totalcost;
          var cashbackamount = 0;
          if (bill.onModel == "Member") {
            cashbackamount = value * value * cashback.member / 100 * paidamountprop;
          }
          else {
            cashbackamount = value * value * cashback.nonmember / 100 * paidamountprop;
          }

          const wallettxn = new Wallettxn({
            txntype: "Cr",
            txnref: "Cashback on " + item.refid.title + " bill #" + bill.docnumber,
            customerid: bill.customerid,
            onModel: bill.onModel,
            wallettype: "General",
            txndate: new Date(),
            value: cashbackamount
          });

          wallettxn.save(req)
            .then(() => {
            })

        }
      })
  });
    
  res.json(req.body.billpayment);
}
