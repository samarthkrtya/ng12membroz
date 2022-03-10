const Joi = require('joi');
const Joborder = require('../models/joborder.model');
const Joborderview = require('../views/joborder.view');

const joborderSchema = Joi.object({

  prefix: Joi.string().required(),
  jobnumber: Joi.number().required(),
  date: Joi.date().required(),
  dueby: Joi.date().allow(null),
  deliverydate: Joi.date().allow(null),
  customerid: Joi.string().hex().required(),
  assetid: Joi.string().hex().required(),
  onModel: Joi.string().required(),
  inwardchallanid : Joi.string().hex(),
  outwardchallanid : Joi.string().hex(),
  items: Joi.array(),
  services: Joi.array(),
  billid : Joi.string().hex(),
  advisorid : Joi.string().hex(),

  amount: Joi.number(),
  totalamount: Joi.number(),
  taxamount: Joi.number(),
  taxdetail: Joi.object(),
  discount: Joi.number(),

  attachments: Joi.array(),
  property: Joi.object()
})


module.exports = {
  insert,
  update,
  patch,
  remove,
  filter,
  filterview,
  getnextdocnumber,
  findcount,
  findbyId,
  exportdata,
  converttojoborder
}

async function findbyId(Id) {
  return await Joborder.findById(Id);
}

async function insert(req) {
  var joborder = {
    prefix: req.body.prefix,
    jobnumber: req.body.jobnumber,
    date: req.body.date,
    dueby: req.body.dueby,
    deliverydate: req.body.deliverydate,
    customerid: req.body.customerid,
    assetid: req.body.assetid,
    onModel: req.body.onModel,
    inwardchallanid: req.body.inwardchallanid,
    outwardchallanid: req.body.outwardchallanid,
    services: req.body.services,
    items: req.body.items,
    billid: req.body.billid,
    advisorid: req.body.advisorid,

    amount: req.body.amount,
    totalamount: req.body.totalamount,
    taxamount: req.body.taxamount,
    taxdetail: req.body.taxdetail,
    discount: req.body.discount,

    attachments: req.body.attachments,
    
    property: req.body.property
  }

  await Joi.validate(joborder, joborderSchema, { abortEarly: false });
  return await new Joborder(joborder).save(req);
}

async function update(Id, req) {
  var joborder = await Joborder.findById(Id);
  joborder._original = joborder.toObject();
  joborder.customerid = req.body.customerid,
  joborder.onModel = req.body.onModel,
  joborder.date = req.body.date,
  joborder.dueby = req.body.dueby,
  joborder.deliverydate = req.body.deliverydate,
  joborder.inwardchallanid = req.body.inwardchallanid,
  joborder.outwardchallanid = req.body.outwardchallanid,
  joborder.services = req.body.services,
  joborder.items = req.body.items,
  joborder.billid = req.body.billid,
  joborder.advisorid = req.body.advisorid,
  

  joborder.amount = req.body.amount,
  joborder.totalamount = req.body.totalamount,
  joborder.taxamount = req.body.taxamount,
  joborder.taxdetail = req.body.taxdetail,
  joborder.discount = req.body.discount,
  
  joborder.attachments = req.body.attachments,
  joborder.property = req.body.property    
  //joborder = await Joi.validate(joborder, joborderSchema, { abortEarly: false });
     await joborder.save(req);  
     return joborder;
}

async function patch(Id, req) {

  var joborder = await Joborder.findById(Id);
  joborder._original = joborder.toObject();

  if (req.body.services) joborder.services = req.body.services;
  if (req.body.billid) joborder.billid = req.body.billid;
  if (req.body.items) joborder.items = req.body.items;
  if (req.body.status) joborder.status = req.body.status;

  joborder.services.forEach(service => {
    if(!service.assignee) {
      service.assignee = null;
    }
  });

  return await joborder.save(req);
}

async function remove(Id, req) {
  var joborder = await Joborder.findById(Id);
  joborder.status = "deleted"
  return await joborder.save(req);
}

async function filter(params) {
  return await Joborder.getbyfilter(params)
}

async function getnextdocnumber(req, res, next) {

  var branch = req.body.authkey.branchid;
  var prefix = "";

  if (DATABASETYPE == "branchwise") {
    var docformat = branch.docformat;
    prefix = docformat.joborder ? docformat.joborder["prefix"] : "JO";
  } else {
    var docformat = BILLFORMAT;
    if (docformat)
      prefix = docformat.joborder ? docformat.joborder["prefix"] : "JO";
  }

  Joborder.getnextdocnumber(prefix, branch._id)
    .then((jobnumber) => {
      req.body.jobnumber = jobnumber;
      req.body.prefix = prefix;
      if (!req.body.customerid) return res.json(prefix + "-" + jobnumber);
      else next();
    })
    .catch((e) => next1(e));

}

async function filterview(params) {
  return await Joborderview.getfilterview(params);
}

async function findcount(req) {
  return await Joborder.findcount(req)
}

async function exportdata(params) {
  return await Joborder.exportdata(params)
}

async function converttojoborder(req, res, next) {
  var joborder = {
    
    prefix: req.body.prefix,
    jobnumber: req.body.jobnumber,
    date: req.body.convertdate,
    dueby: req.body.dueby,
    deliverydate: req.body.deliverydate,

    customerid: req.body.customerid,
    onModel: req.body.convertModel,

    assetid: req.body.contextid,

    inwardchallanid: req.body.inwardchallanid,
    outwardchallanid: req.body.outwardchallanid,
    services: req.body.services,
    items: req.body.items,
    billid: req.body.billid,
    advisorid: req.body.advisorid,

    amount: req.body.amount,
    totalamount: req.body.totalamount,
    taxamount: req.body.taxamount,
    taxdetail: req.body.taxdetail,
    discount: req.body.discount,

    attachments: req.body.attachments,
    
    property: {
      inspectionid: req.body.inspectionid
    }
  }

  await Joi.validate(joborder, joborderSchema, { abortEarly: false });
  var joborderres =  await new Joborder(joborder).save(req);
  req.body.joborderid = joborderres._id
  next()
}

