const Joi = require('joi');
const Billitem = require('../models/billitem.model');
const Billitemview = require('../views/billitem.view');
import async from "async";
const Event = require('../models/event.model');
const Resort = require('../models/resort.model');
const Tourpackage = require('../models/tourpackage.model');

const billitemSchema = Joi.object({
  itemname: Joi.string().required(),
  category: Joi.string().hex().required(),
  sale: Joi.object().required(),
  purchase: Joi.object(),
  rent: Joi.object(),
  imagegallery : Joi.array(),
  barcode : Joi.string().allow(null),
  unit : Joi.string(),
  enableinventory : Joi.boolean(),
  provider: Joi.string().hex(),
  property: Joi.object(),
})


module.exports = {
  insert,
  update,
  patch,
  remove,
  filter,
  findcount,
  inserteventbillitem,
  insertroombillitem,
  insertpackagebillitem,
  findbyId,
  filterview,
  exportdata
}

async function insertpackagebillitem(req) {

  var data = req.body.data;
  var sale = { rate: data.cost, taxes: data.taxes }
  if (data.itemid) {
    Billitem.findByIdAndUpdate(data.itemid, { "$set": { "sale": sale, itemname: "Package cost " + data.title } }).then((item) => {
      return data;
    })
  }
  else {

    var item = {
      itemname: "Package cost " + data.title,
      category: req.body.category,
      sale: sale,
      unit: "pcs",
    }
    Billitem(item).save(req).then((item) => {
      Tourpackage.findByIdAndUpdate(data._id, { "$set": { "itemid": item._id } }).then()
      return data;
    })
  }

}

async function insertroombillitem(req) {

  var billitems = req.body.data.tariff ? req.body.data.tariff : [];

  async.forEachSeries(billitems, (billitem, next) => {

    var sale = { rate: billitem.cost, taxes: billitem.taxes }
    if (billitem.itemid) {

      Billitem.findByIdAndUpdate(billitem.itemid, { "$set": { "sale": sale } }).then((item) => {
        billitem.itemid = item._id;
        next()
      })
    }
    else {

      var item = {
        itemname:  req.body.itemname + ' - ' + billitem.roomtype,
        category: req.body.category,
        sale: sale,
        unit: "pcs",
      }
      Billitem(item).save(req).then((item) => {
        billitem.itemid = item._id;
        next()
      })
    }

  }, function () {
    Resort.findByIdAndUpdate(req.body.data._id, { "$set": { tariff: billitems } }).then();
  });

}

async function findbyId(Id) {
  return await Billitem.findById(Id);
}


async function inserteventbillitem(req) {

  var billitems = req.body.data.tickets ? req.body.data.tickets : [];

  async.forEachSeries(billitems, (billitem, next) => {

    var sale = { rate: billitem.cost, taxes: billitem.taxes }
    if (billitem.itemid) {

      Billitem.findByIdAndUpdate(billitem.itemid, { "$set": { "sale": sale } }).then((item) => {
        billitem.itemid = item._id;
        next()
      })
    }
    else {

      var item = {
        itemname: req.body.itemname + ' ' + billitem.tickettype,
        category: req.body.category,
        sale: sale,
        unit: "pcs",
      }
      Billitem(item).save(req).then((item) => {
        billitem.itemid = item._id;
        next()
      })
    }

  }, function () {
    Event.findByIdAndUpdate(req.body.data._id, { "$set": { tickets: billitems } }).then();
  });

}

async function insert(req) {
  var billitem = {
    itemname: req.body.itemname,
    category: req.body.category,
    purchase: req.body.purchase,
    sale: req.body.sale,
    rent: req.body.rent,
    imagegallery: req.body.imagegallery,
    barcode: req.body.barcode,
    enableinventory: req.body.enableinventory,
    unit: req.body.unit,
    property: req.body.property
  }

  if (req.body.property && req.body.property.salesrate){
    billitem.sale = {
      rate: req.body.property.salesrate
    }
  }

  await Joi.validate(billitem, billitemSchema, { abortEarly: false });
  return await new Billitem(billitem).save(req);
}

async function update(Id, req) {

  var body = req.body;
  var billitem = await Billitem.findById(Id);
  billitem._original = billitem.toObject();
  billitem.itemname = body.itemname,
  billitem.category = body.category,
  billitem.sale = body.sale,
  billitem.purchase = body.purchase,
  billitem.rent = body.rent,
  billitem.imagegallery = body.imagegallery,
  billitem.barcode = body.barcode,
  billitem.enableinventory = body.enableinventory,
  billitem.unit = body.unit,
  billitem.property = body.property
  
  if (req.body.property && req.body.property.salesrate){
    billitem.sale = {
      rate: req.body.property.salesrate
    }
  }
  return await billitem.save(req)
}

async function remove(Id, req) {
  var billitem = await Billitem.findById(Id);
  billitem.status = "deleted"
  return await billitem.save(req);
}

async function patch(Id, req) {
  var billitem = await Billitem.findById(Id);
  billitem._original = billitem.toObject();
  if (req.body.itemname) billitem.itemname = req.body.itemname;

  return await billitem.save(req);
}



async function filter(req) {
  return await Billitem.getbyfilter(req)
}

async function filterview(req) {
  return await Billitemview.getbyfilter(req)
}

async function findcount(params) {
  return await Billitem.findcount(params)
}

async function exportdata(params) {

  return await Billitem.exportdata(params)
}
