const Joi = require('joi');
const Campaign = require('../models/campaign.model');
const Campaignview = require('../views/campaign.view');
var ObjectID = require('mongodb').ObjectID;
const commonCtrl = require('../controllers/common.controller');

const campaignSchema = Joi.object({
  campaignname: Joi.string().required(),
  //saleschannelteams: Joi.string().hex().required(),
  property: Joi.object().required(),
})


module.exports = {
  insert,
  update,
  patch,
  remove,
  filter,
  filterview,
  findcount,
  findbyId,
  exportdata,
  getcampaignteams
}

async function findbyId(Id) {
  return await Campaign.findById(Id);
}


async function getcampaignteams(id) {

  return Campaign.findById(ObjectID(id))
    .then((campaing) => {

      if (!campaing) return res.json([]);
      var salesteam = campaing.saleschannelteams? campaing.saleschannelteams.channels: [];
      var users = [];

      salesteam.forEach(function(e){
        users.push({ "userid": e.userid._id, "fullname": e.userid.fullname, "designation": e.designationid.title })
      });

      return users;
    })

}


async function insert(req) {
  var campaign = {
    saleschannelteams: req.body.saleschannelteams,
    campaignname: req.body.campaignname,
    campaigntype: req.body.campaigntype,
    property: req.body.property,
  } 
  // await Joi.validate(campaign, campaignSchema, { abortEarly: false });
  return await new Campaign(campaign).save(req);
}

async function update(Id, req) {
  var campaign = await Campaign.findById(Id);
  campaign._original = campaign.toObject();
  campaign.campaignname = req.body.campaignname
  campaign.property = req.body.property
  campaign.saleschannelteams = req.body.saleschannelteams
  return await campaign.save(req);
}

async function patch(Id, req) {
  var campaign = await Campaign.findById(Id);
  campaign._original = campaign.toObject();
  if (req.body.campaignname) campaign.campaignname = req.body.campaignname;
  if (req.body.content) campaign.content = req.body.content;
  if (req.body.property) campaign.property = req.body.property;
  if (req.body.groupids) campaign.groupids = req.body.groupids;
  await commonCtrl.updatethumbnail(campaign);
  campaign.saleschannelteams = req.body.saleschannelteams
  return await campaign.save(req);
}

async function remove(Id, req) {
  var campaign = await Campaign.findById(Id);
  campaign.status = "deleted"
  return await campaign.save(req);
}

async function filter(params) {
  return await Campaign.getbyfilter(params)
}

async function filterview(params) {
  return await Campaignview.getfilterview(params)
}

async function findcount(req) {
  return await Campaign.findcount(req)
}

async function exportdata(params) {
  return await Campaign.exportdata(params)
}
