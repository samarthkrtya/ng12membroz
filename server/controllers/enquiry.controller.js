const Joi = require('joi');
const Enquiry = require('../models/enquiry.model');
const Enquiryview = require('../views/enquiry.view');
const Activityview = require('../views/activity.view');
const Communicationlogview = require('../views/communicationlog.view');
const Timelineview = require('../views/timeline.view');
import async from "async";
var ObjectId = require('mongodb').ObjectId;
var MongoClient = require('mongodb').MongoClient;
var url = process.env.MONGO_HOST;

const enquirySchema = Joi.object({
  property: Joi.object().required(),
  profilepic: Joi.string(),
  stage: Joi.string(),
  campaignid: Joi.string().hex().allow(null),
  prospectid: Joi.string().hex().allow(null),
  attachments: Joi.array().allow(null),
  memberid: Joi.string().hex().allow(null),
  handlerid: Joi.string().hex().allow(null)
})


module.exports = {
  insert,
  update,
  patch,
  remove,
  filter,
  filterview,
  timelinefilterview,
  acivityfilterview,
  communicationfilterview,
  findcount,
  findbyId,
  exportdata,
  updateenquiries,
  updatemultienquiries,
  getEnquiry
}

async function findbyId(Id) {
  return await Enquiry.findById(Id);
}

async function insert(req) {
  var enquiry = {
    property: req.body.property,
    stage: req.body.stage,
    campaignid: req.body.campaignid ? req.body.campaignid : req.body.property.campaignid != '' ? req.body.property.campaignid : null,
    memberid: req.body.memberid,
    attachments: req.body.attachments,
    prospectid: req.body.prospectid,
    profilepic: req.body.profilepic,
    handlerid: req.body.handlerid ? req.body.handlerid : req.body.authkey._id.toString()

  }
  await Joi.validate(enquiry, enquirySchema, { abortEarly: false });
  return await new Enquiry(enquiry).save(req);
}

async function update(Id, req) {
  var enquiry = await Enquiry.findById(Id);
  enquiry._original = enquiry.toObject();
  enquiry.property = req.body.property,
  enquiry.stage = req.body.stage
  enquiry.campaignid = req.body.campaignid
  enquiry.memberid = req.body.memberid
  enquiry.attachments = req.body.attachments
  
  enquiry.prospectid = req.body.prospectid
  enquiry.profilepic = req.body.profilepic
  enquiry.handlerid = req.body.handlerid
  return await enquiry.save(req);
}

async function patch(Id, req) {
  var enquiry = await Enquiry.findById(Id);
  enquiry._original = enquiry.toObject();
  if (req.body.property) enquiry.property = req.body.property;
  if (req.body.stage) enquiry.stage = req.body.stage;
  if (req.body.campaignid) enquiry.campaignid = req.body.campaignid;
  if (req.body.handlerid) enquiry.handlerid = req.body.handlerid;
  if (req.body.memberid) enquiry.memberid = req.body.memberid;
  if (req.body.attachments) enquiry.attachments = req.body.attachments;
  
  if (req.body.profilepic) enquiry.profilepic = req.body.profilepic;
  if (req.body.prospectid) enquiry.prospectid = req.body.prospectid;
  if (req.body.status) enquiry.status = req.body.status;
  return await enquiry.save(req);
}

async function remove(Id, req) {
  var enquiry = await Enquiry.findById(Id);
  enquiry.status = "deleted"
  return await enquiry.save(req);
}

async function filter(params) {
  return await Enquiry.getbyfilter(params)
}

async function filterview(params) {
  return await Enquiryview.getfilterview(params)
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

async function findcount(req) {
  return await Enquiry.findcount(req)
}

async function exportdata(params) {
  return await Enquiry.exportdata(params)
}

async function updateenquiries(req, res) {

  var enquiryids = req.body.enquiries;
  var handlerid = req.body.handlerid;

    async.forEachSeries(enquiryids, (enquiry, next) =>{

          Enquiry.findByIdAndUpdate(enquiry, { "$set": { handlerid: handlerid } }).then((en)=> {
          next()
          });


      }, function(){
        //console.log("finished");
        res.json({"msg": "Updated successfully"});
      });

}


async function updatemultienquiries(req, res) {

  var enquiryids = req.body.enquiries.length;
  var handlerids = req.body.handlerid.length;
  var objhandlerids = [];
  var divide = Math.floor(enquiryids/handlerids)
  var client = await MongoClient.connect(url);
  var db = client.db();
  //console.log("enquiryids", enquiryids)
  req.body.enquiries.forEach(enquiry => {
    objhandlerids.push(ObjectId(enquiry))
  });

  async.times(handlerids, function (n, next) {
    var start = n * divide;
    var end = divide * (n + 1)
    var dividedenquiries = objhandlerids.slice(start, end);
    db.collection("enquiries").updateMany({ _id: { "$in": dividedenquiries } }, { "$set": { "handlerid": ObjectId(req.body.handlerid[n]) } }).then((result) => {
      next()
    });

    if (handlerids == n + 1) {
      var remainings = objhandlerids.slice(end);
      //console.log("remainings", remainings)
      async.times(handlerids, function (n, next) {
        if (remainings[n]) {
          db.collection("enquiries").updateMany({ _id: remainings[n] }, { "$set": { "handlerid": ObjectId(req.body.handlerid[n]) } }).then((result) => {
            next()
          });
        }
      })

    }

  }, function () {
    //console.log("finished");
    res.json({ "msg": "Updated successfully" });
  });


}


async function getEnquiry(req, res, next) {

  console.log("getEnquiry called");

  var enquiryid = req.params.enquiryid
  var property = req.body.property;

  Enquiry.findById(enquiryid)
    .then((prospect) => {
      req.body.property = Object.assign(prospect.property, property);
      next();
    })
    .catch(e => next(e));
}
