const Joi = require('joi');
const Prospect = require('../models/prospect.model');
const Prospectview = require('../views/prospect.view');
const Activityview = require('../views/activity.view');
const Communicationlogview = require('../views/communicationlog.view');
const Timelineview = require('../views/timeline.view');
const CustomerwalletSchema = require('../views/customerwallet.view');
const Packageusagesummaryview = require('../views/packageusagesummary.view');

const prospectSchema = Joi.object({
  property: Joi.object().required(),
  stage: Joi.string(),
  memberid: Joi.string().hex(),
  handlerid: Joi.string().hex().allow(null),
  campaignid: Joi.string().hex().allow(null),
  status: Joi.string(),
})

module.exports = {
  insert,
  update,
  patch,
  remove,
  filter,
  timelinefilterview,
  walletfilterview,
  usagesummaryview,
  updatepackages,
  acivityfilterview,
  communicationfilterview,
  findcount,
  findbyId,
  filterview,
  exportdata,
  getprospect
}

async function findbyId(Id) {
  return await Prospect.findById(Id);
}

async function insert(req) {
  var prospect = {
    property: req.body.property,
    stage: req.body.stage,
    memberid: req.body.memberid,
    handlerid: req.body.handlerid,
    campaignid: req.body.campaignid,
    status: req.body.status,

  }
  await Joi.validate(prospect, prospectSchema, { abortEarly: false });
  return await new Prospect(prospect).save(req);
}

async function update(Id, req) {
  var prospect = await Prospect.findById(Id);
  prospect._original = prospect.toObject();
  prospect.property = req.body.property,
  prospect.stage = req.body.stage,
  prospect.memberid = req.body.memberid
  return await prospect.save(req);
}

async function patch(Id, req) {
  var prospect = await Prospect.findById(Id);
  prospect._original = prospect.toObject();
  if (req.body.property) prospect.property = req.body.property;
  if (req.body.attachments) prospect.attachments = req.body.attachments;
  if (req.body.stage) prospect.stage = req.body.stage;
  if (req.body.status) prospect.status = req.body.status;
  if (req.body.profilepic) prospect.profilepic = req.body.profilepic;
  if (req.body.memberid) prospect.memberid = req.body.memberid;
  if (req.body.addons) prospect.addons = req.body.addons;
  return await prospect.save(req);
}

async function remove(Id, req) {
  var prospect = await Prospect.findById(Id);
  prospect.status = "deleted"
  return await prospect.save(req);
}

async function filter(params) {
  return await Prospect.getbyfilter(params)
}

async function filterview(params) {
  return await Prospectview.getfilterview(params)
}

async function acivityfilterview(params) {
  return await Activityview.getfilterview(params)
}

async function communicationfilterview(params) {
  return await Communicationlogview.getfilterview(params)
}

async function timelinefilterview(params) {
  return await Timelineview.getfilterview(params)
}

async function walletfilterview(params) {
  return await CustomerwalletSchema.getfilterview(params)
}

async function usagesummaryview(params) {
  return await Packageusagesummaryview.getfilterview(params)
}

async function findcount(req) {
  return await Prospect.findcount(req)
}

async function exportdata(params) {
  return await Prospect.exportdata(params)
}

async function updatepackages(req, res, next) {

  var _id = req.body._id;
  var addons = {
    paymentterms: req.body.paymentterms,
    membershipid: req.body.membershipid,
    membershipstart: req.body.membershipstart,
    membershipend: req.body.membershipend
  }

  Prospect.findByIdAndUpdate(_id, { "$push": { addons: addons } }, { new: true })
    .populate("addons.membershipid")
    .populate("addons.paymentterms")
    .exec()
    .then(member => {
      var addon = member.addons.find(el =>{
        return el.membershipid._id.toString() == req.body.membershipid.toString();
      })
      req.body.memberid = member._id;
      req.body.paymentterms = addon.paymentterms;
      next();
    });

}

async function getprospect(req, res, next) {

  console.log("getprospect called");

  var prospectid = req.params.prospectid
  var property = req.body.property;

  Prospect.findById(prospectid)
    .then((prospect) => {
      req.body.property = Object.assign(prospect.property, property);
      if (prospect.disposition){
        req.body.saledisposition = prospect.disposition;
      }
      next();
    })
    .catch(e => next(e));
}
