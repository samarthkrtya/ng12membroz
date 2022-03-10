const Joi = require('joi');
const Leaseorder = require('../models/leaseorder.model');

const leaseorderSchema = Joi.object({
  leasenumber: Joi.number().required(),
  prefix: Joi.string().required(),
  customerid: Joi.string().hex().required(),
  onModel: Joi.string().required(),
  date: Joi.date().required(),
  returndate: Joi.date().allow(null),
  inwardchallanid : Joi.string().hex(),
  outwardchallanid : Joi.string().hex(),
  assets: Joi.array().required(),
  items: Joi.array(),
  billid : Joi.string().hex(),
  notes: Joi.string(),
  attachments: Joi.array(),
  property: Joi.object()
})


module.exports = {
  insert,
  update,
  patch,
  remove,
  filter,
  getnextdocnumber,
  findcount,
  findbyId,
  exportdata
}

async function findbyId(Id) {
  return await Leaseorder.findById(Id);
}

async function insert(req) {

  var leaseorder = {
    leasenumber: req.body.leasenumber,
    prefix: req.body.prefix,
    customerid: req.body.customerid,
    onModel: req.body.onModel,
    date: req.body.date,
    returndate: req.body.returndate,
    inwardchallanid: req.body.inwardchallanid,
    outwardchallanid: req.body.outwardchallanid,
    assets: req.body.assets,
    items: req.body.items,
    billid: req.body.billid,
    notes: req.body.notes,
    attachments: req.body.attachments,
    property: req.body.property
  }

  await Joi.validate(leaseorder, leaseorderSchema, { abortEarly: false });
  return await new Leaseorder(leaseorder).save(req);
}

async function update(Id, req) {
  var leaseorder = await Leaseorder.findById(Id);
  leaseorder._original = leaseorder.toObject();
  leaseorder.customerid = req.body.customerid,
  leaseorder.onModel = req.body.onModel,
  leaseorder.date = req.body.date,
  leaseorder.returndate = req.body.returndate,
  leaseorder.inwardchallanid = req.body.inwardchallanid,
  leaseorder.outwardchallanid = req.body.outwardchallanid,
  leaseorder.assets = req.body.assets,
  leaseorder.items = req.body.items,
  leaseorder.billid = req.body.billid,
  leaseorder.notes = req.body.notes,
  leaseorder.attachments = req.body.attachments,
  leaseorder.property = req.body.property

  return await leaseorder.save(req);
}


async function patch(Id, req) {
  var leaseorder = await Leaseorder.findById(Id);
  leaseorder._original = leaseorder.toObject();

  if (req.body.billid) leaseorder.billid = req.body.billid;
  
  return await leaseorder.save(req);
}

async function remove(Id, req) {
  var leaseorder = await Leaseorder.findById(Id);
  leaseorder.status = "deleted"
  return await leaseorder.save(req);
}

async function filter(params) {
  return await Leaseorder.getbyfilter(params)
}

async function getnextdocnumber(req, res, next) {

  var branch = req.body.authkey.branchid;
  var prefix = "";

  if (DATABASETYPE == "branchwise") {
    var docformat = branch.docformat;
    prefix = docformat.leaseorder ? docformat.leaseorder["prefix"] : "LO";
  } else {
    var docformat = BILLFORMAT;
    if (docformat)
      prefix = docformat.leaseorder ? docformat.leaseorder["prefix"] : "LO";
  }

  Leaseorder.getnextdocnumber(prefix, branch._id)
    .then((leasenumber) => {
      req.body.leasenumber = leasenumber;
      req.body.prefix = prefix;
      if (!req.body.customerid) return res.json(prefix + "-" + leasenumber);
      else next();
    })
    .catch((e) => next1(e));

}

async function findcount(req) {
  return await Leaseorder.findcount(req)
}

async function exportdata(params) {
  return await Leaseorder.exportdata(params)
}
