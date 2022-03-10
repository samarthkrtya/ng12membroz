const Joi = require('joi');
const Organizationsetting = require('../models/organizationsetting.model');

const organizationsettingSchema = Joi.object({
  logo: Joi.string(),
  adminloginimage: Joi.string(),
  memberloginimage: Joi.string(),
  weburl: Joi.string(),
  webtitle: Joi.string(),
  loginheader: Joi.string(),
  loginsubheader: Joi.string(),
  copyright: Joi.string(),
  supportedlanguage: Joi.array(),
  whatsappconfig: Joi.object(),
  androidPushNotificationAuthorizationKey: Joi.string(),
  iosPushNotificationOptions: Joi.object(),
  iosPushNotificationtopic: Joi.string(),
  cloud_name: Joi.string(),
  support: Joi.object(),
  fromemails: Joi.string(),
  replyemails: Joi.string(),
  sendgridkey: Joi.string(),
  smsgateway: Joi.string(),
  allowmemberlogin: Joi.boolean(),
  autologout: Joi.boolean(),
  autologouttimeout: Joi.number(),
  globalsearch: Joi.array(),
  databasetype: Joi.string(),
  systemsecurity : Joi.object(),
  dateformat: Joi.string(),
})


module.exports = {
  update,
  findOne
}

async function findOne() {
  return await Organizationsetting.find();
}

async function update(Id, req) {
  var organizationsetting = await Organizationsetting.findById(Id);
  organizationsetting.logo = req.body.logo;
  organizationsetting.adminloginimage = req.body.adminloginimage;
  organizationsetting.memberloginimage = req.body.memberloginimage;
  organizationsetting.weburl = req.body.weburl;
  organizationsetting.webtitle = req.body.webtitle;
  organizationsetting.loginheader = req.body.loginheader;
  organizationsetting.loginsubheader = req.body.loginsubheader;
  organizationsetting.copyright = req.body.copyright;
  organizationsetting.supportedlanguage = req.body.supportedlanguage;
  organizationsetting.whatsappconfig = req.body.whatsappconfig;
  organizationsetting.androidPushNotificationAuthorizationKey = req.body.androidPushNotificationAuthorizationKey;
  organizationsetting.iosPushNotificationOptions = req.body.iosPushNotificationOptions;
  organizationsetting.iosPushNotificationtopic = req.body.iosPushNotificationtopic;
  organizationsetting.cloud_name = req.body.cloud_name;
  organizationsetting.support = req.body.support;
  organizationsetting.fromemails = req.body.fromemails;
  organizationsetting.replyemails = req.body.replyemails;
  organizationsetting.sendgridkey = req.body.sendgridkey;
  organizationsetting.smsgateway = req.body.smsgateway;
  organizationsetting.allowmemberlogin = req.body.allowmemberlogin;
  organizationsetting.autologout = req.body.autologout;
  organizationsetting.autologouttimeout = req.body.autologouttimeout;
  organizationsetting.globalsearch = req.body.globalsearch;
  organizationsetting.databasetype = req.body.databasetype;
  organizationsetting.dateformat = req.body.dateformat;
  organizationsetting.systemsecurity = req.body.systemsecurity;
  
  return await organizationsetting.save();
}
