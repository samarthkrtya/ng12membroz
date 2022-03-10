const Joi = require('joi');
const Inventory = require('../models/inventory.model');

const inventorySchema = Joi.object({
  itemid: Joi.string().hex().required()
})


module.exports = {
  insert,
  update,
  patch,
  remove,
  filter,
  findcount,
  findbyId,
  findybyItemid,
  updateinventory,
  exportdata,
  updatetriggerqty
}

async function updateinventory(body) {

  var bill = body.bill ? body.bill : body.purchaseinvoice;
  var add = body.bill ? false : true;
  var olditems = body.olditems ? body.olditems : [];
  if (bill.items)
    bill.items.forEach(item => {
      if (item.item && item.item.enableinventory) {
        var olditem = olditems.find((e) => {
          return e.item._id.toString() == item.item.toString()
        })
        var quantity = item.quantity;
        if (olditem) {
          quantity -= olditem.quantity;
        }
        if (add) {
          Inventory.findOneAndUpdate({ itemid: item.item._id }, { $inc: { stock: quantity } }).then().catch((e) => console.log(e))
        }
        else {
          Inventory.findOneAndUpdate({ itemid: item.item._id }, { $inc: { stock: -quantity } }).then().catch((e) => console.log(e))
        }
      }
    });

  return body.bill ? body.bill : body.purchaseinvoice;
}

async function updatetriggerqty(req) {
  var inventories = req.body.inventories
  inventories.forEach(item => {
    //console.log(item)
    Inventory.findOneAndUpdate({ _id: item._id }, { $set: { triggerqty: item.triggerqty } }).then()
  });
  return inventories;
}

async function findybyItemid(Id) {
  return await Inventory.findOne({ itemid: Id });
}

async function findbyId(Id) {
  return await Inventory.findById(Id);
}

async function insert(req) {
  var inventory = {
    itemid: req.body.itemid
  }
  //  inventory = await Joi.validate(inventory, inventorySchema, { abortEarly: false });
  return await new Inventory(inventory).save(req);
}

async function patch(Id, req) {
  var inventory = await Inventory.findById(Id);
  inventory._original = inventory.toObject();
  if (req.body.triggerqty) inventory.triggerqty = req.body.triggerqty;
  return await inventory.save(req);
}

async function update(Id, req) {
  var inventory = await Inventory.findById(Id);
  inventory._original = inventory.toObject();

  inventory.itemid = req.body.itemid;
  inventory.stock = req.body.stock;
  inventory.triggerqty = req.body.triggerqty;

  return await inventory.save(req);
}

async function remove(Id, req) {
  var inventory = await Inventory.findById(Id);
  inventory.status = "deleted"
  return await inventory.save(req);
}

async function filter(req) {
  return await Inventory.getbyfilter(req)
}

async function findcount(params) {
  return await Inventory.findcount(params)
}

async function exportdata(params) {
  return await Inventory.exportdata(params)
}
