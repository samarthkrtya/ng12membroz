// const bcrypt = require('bcrypt');
const Joi = require('joi');
const Membershipusage = require('../models/membershipusage.model');
const Membershipusageview = require('../views/membershipusage.view');
const Member = require('../models/member.model');
const Prospect = require('../models/prospect.model');
const Billitem = require('../models/billitem.model');
const Booking = require('../models/booking.model');

const membershipusageSchema = Joi.object({
  customerid: Joi.string().hex().required(),
  membershipid: Joi.string().hex().required(),
  onModel: Joi.string().required(),
  billid: Joi.string().hex().required(),
  usage: Joi.array().required(),
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
  updateusage,
  getmembershipdiscount
}

async function findbyId(Id) {
  return await Membershipusage.findById(Id);
}

async function insert(req) {
  var membershipusage = {
    title: req.body.title,
    property: req.body.property
  }
  membershipusage = await Joi.validate(membershipusage, membershipusageSchema, { abortEarly: false });
  return await new Membershipusage(membershipusage).save(req);
}

async function getmembershipdiscount(req) {

  var customerid = req.body.customerid;
  var onModel = req.body.onModel;
  var items = req.body.items ? req.body.items : [];
  var services = req.body.services ? req.body.services : [];
  var assets = req.body.assets ? req.body.assets : [];
  var customer;
  if (onModel == "Member") {
    customer = await Member.findById(customerid)
      .populate("addons.membershipid")
  }
  else if (onModel == "Prospect") {
    customer = await Prospect.findById(customerid)
      .populate("addons.membershipid")
  }
  return await getdiscountdetail(items, services, assets, customer);

}

async function getdiscountdetail(items, services, assets, customer, billid) {

  var membershipitems = []
  var membershipservices = []
  var membershipassets = []
  var memberships = [];
  var membershipdiscount = [];

  if (customer && customer.membershipend > new Date()) memberships.push(customer.membershipid);
  var addons = customer && customer.addons ? customer.addons : [];
  if (addons.length > 0) {
    addons.forEach(addon => {
      if (addon.membershipend > new Date()) memberships.push(addon.membershipid);
    });
  }
  var pastusages;
  if(customer){
    pastusages = await Membershipusageview.find({ customerid: customer._id });
  }
  var bookingid = await Booking.findOne({ billid: billid });

  memberships.forEach(membership => {
    membership.items.forEach((item) => {
      membershipitems.push({ membershipid: membership._id, item: item, type: "billitem" });
    })
    membership.services.forEach((service) => {
      membershipservices.push({ membershipid: membership._id, item: service, type: "service" });
    })
    membership.assets.forEach((asset) => {
      membershipassets.push({ membershipid: membership._id, item: asset, type: "asset" });
    })

    if (membership.usageterms) {
      var item = {
        item: null,
        quantity: membership.usageterms.eligiblenight,
        discount: 100,
        type: "booking",
        bookingid: bookingid
      }
      membershipitems.push({ membershipid: membership._id, item: item });
    }

  })
  //console.log("membershipassets", membershipassets)
  // console.log("membershipservices", membershipservices)
  items.forEach(item => {

    var itemusage = membershipitems.find(itemusage => {
      var itemid = itemusage.item.item ? itemusage.item.item._id : itemusage.item._id;
      if (!itemid) return itemusage;
      return itemusage.type == "billitem" &&
        item.item._id.toString() == itemid.toString();
    })

    if (itemusage) {
      var pastusage = pastusages.find(pastusage => {
        if (pastusage.usagetype=="Booking") return pastusage;
        return itemusage.item && itemusage.item.item && itemusage.item.item._id && pastusage.refid.toString() == itemusage.item.item._id.toString()
      })

      var qty = 0;
      if (pastusage) {
        var consumeqty = pastusage.quantity + item.quantity;
        if (itemusage.item.quantity < consumeqty && itemusage.item.quantity > pastusage.quantity) {
          qty = itemusage.item.quantity - pastusage.quantity;
        }
        else if (itemusage.item.quantity < consumeqty && itemusage.item.quantity >= pastusage.quantity) {
          qty = 0;
        }
        else {
          qty = item.quantity
        }

      }
      else if (item.quantity >= itemusage.item.quantity) {
        qty = itemusage.item.quantity
      }
      else if (item.quantity < itemusage.item.quantity) {
        qty = item.quantity
      }
      var discounttype = itemusage.item.type ? itemusage.item.type : "billitem";
      var rate = item.sale ? item.sale.rate : item.item.sale.rate;
      var itemid = item.itemid ? item.itemid : item.item._id;
      var discount = itemusage.item.discount * rate * qty / 100;
      var bookingid = itemusage.item.bookingid ? itemusage.item.bookingid : null;

      if (qty <= 0) return;
      membershipdiscount.push({ itemid: itemid, membershipid: itemusage.membershipid, cost: rate, quantity: qty, type: discounttype, discount: discount, bookingid: bookingid })
    }

  })

  services.forEach(service => {

    var itemusage = membershipservices.find(itemusage => {
      // console.log("itemusage", itemusage)
      // console.log("service", service)
      var refid = service.refid._id ? service.refid._id : service.refid
      return itemusage.type == "service" &&
          refid.toString() == itemusage.item.serviceid._id.toString();
    })

    if (itemusage) {
      var pastusage = pastusages.find(pastusage => {
        if (pastusage.refid)
          return pastusage.refid.toString() == itemusage.item.serviceid._id.toString()
      })
      var qty = 0;
      service.cost = service.charges ? service.charges : service.cost;
      if (pastusage) {

        var consumeqty = pastusage.quantity + service.quantity;
        if (itemusage.item.visits < consumeqty && itemusage.item.visits > pastusage.quantity) {
          qty = itemusage.item.visits - pastusage.quantity;
        }
        else if (itemusage.item.visits < consumeqty && itemusage.item.visits >= pastusage.quantity) {
          qty = 0;
        }
        else {
          qty = 1
        }

      }
      else if (1 >= itemusage.item.visits) {
        qty = itemusage.item.visits
      }
      else if (1 < itemusage.item.visits) {
        qty = 1
      }
      // console.log("service", service)
      //console.log("itemusage", itemusage)
      var discount = itemusage.item.discount * service.cost * qty / 100;
      if (qty <= 0 || discount <= 0) return;
      membershipdiscount.push({ serviceid: service.refid, membershipid: itemusage.membershipid, cost: service.cost * qty, quantity: qty, type: "service", discount: discount })
      // console.log("membershipdiscount #1", membershipdiscount)
    }

  })

  assets.forEach(asset => {
    var itemusage = membershipassets.find(itemusage => {
      var refid = asset.refid._id ? asset.refid._id : asset.refid
      return itemusage.type == "asset" && itemusage.item.serviceid._id.toString() == refid.toString();
    })

    if (itemusage) {
      var pastusage = pastusages.find(pastusage => {
        if (pastusage.refid)
          return pastusage.refid.toString() == itemusage.item.serviceid._id.toString()
      })

      var qty = 0;
      //console.log("asset", asset)
      asset.quantity = asset.quantity ? asset.quantity : 1
      asset.charges = asset.charges ? asset.charges : asset.cost;
      if (pastusage) {

        var consumeqty = pastusage.quantity + asset.quantity;
        if (itemusage.item.visits < consumeqty && itemusage.item.visits > pastusage.quantity) {
          qty = itemusage.item.visits - pastusage.quantity;
        }
        else if (itemusage.item.visits < consumeqty && itemusage.item.visits >= pastusage.quantity) {
          qty = 0;
        }
        else {
          qty = asset.quantity
        }

      }
      else if (asset.quantity >= itemusage.item.visits) {
        qty = itemusage.item.visits
      }
      else if (asset.quantity < itemusage.item.visits) {
        qty = asset.quantity;
      }

      var discount = itemusage.item.discount * asset.charges * qty / 100;
      if (qty <= 0 || discount <= 0) return;
      membershipdiscount.push({ serviceid: asset.refid, membershipid: itemusage.membershipid, cost: asset.charges * qty, quantity: qty, type: "asset", discount: discount })
    }

  })
  return membershipdiscount;

}


async function updateusage(req) {

  var bill = req.body.bill;
  var customerid = req.body.bill.customerid;
  var onModel = req.body.bill.onModel;
  var items = req.body.bill.items ? req.body.bill.items : [];
  var services = req.body.bill.services ? req.body.bill.services : [];
  var assets = req.body.bill.assets ? req.body.bill.assets : [];
  var membershipusages = [];
  var membershipdiscount = 0;
  var customer;

  if (onModel == "Member") {
    customer = await Member.findById(customerid)
      .populate("addons.membershipid")
  }
  else if (onModel == "Prospect") {
    customer = await Prospect.findById(customerid)
      .populate("addons.membershipid")
  }

  var membershipdiscounts = await getdiscountdetail(items, services, assets, customer, bill._id);
  membershipdiscounts.forEach((membershipdiscount) => {

    var refid;
    if (membershipdiscount.bookingid) {
      refid = membershipdiscount.bookingid
    }
    else {
      refid = membershipdiscount.itemid ? membershipdiscount.itemid : membershipdiscount.serviceid
    }

    var membershipusage = {
      customerid: customerid,
      onModel: onModel,
      membershipid: membershipdiscount.membershipid,
      billid: bill._id,
      usage: {
        refid: refid,
        onModel: titleCase(membershipdiscount.type),
        quantity: membershipdiscount.quantity,
        cost: membershipdiscount.cost,
        discount: membershipdiscount.discount
      },
    }
    membershipdiscount += membershipdiscount.discount;
    membershipusages.push(membershipusage);

  });
  await Membershipusage.insertMany(membershipusages);
  return membershipdiscount;

}

async function update(Id, req) {
  var membershipusage = await Membershipusage.findById(Id);
  membershipusage._original = membershipusage.toObject();
  membershipusage.title = req.body.title,
  membershipusage.property = req.body.property
  return await membershipusage.save(req);
}

async function remove(Id, req) {
  var membershipusage = await Membershipusage.findById(Id);
  membershipusage.status = "deleted"
  return await membershipusage.save(req);
}

async function filter(params) {
  return await Membershipusage.getbyfilter(params)
}

async function findcount(req) {
  return await Membershipusage.findcount(req)
}

async function exportdata(params) {
  return await Membershipusage.exportdata(params)
}

function titleCase(str) {
  return str.toLowerCase().replace(/\b(\w)/g, s => s.toUpperCase());
}
