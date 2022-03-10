const Joi = require('joi');
const Communication = require('../models/communication.model');
const Member = require('../models/member.model');
const User = require('../models/user.model');
import email from '../helpers/email';
import whatsapp from '../helpers/whatsapp';
import pushalerts from '../helpers/pushalert';
import sms from '../helpers/sms';
import common from '../helpers/common';

const communicationSchema = Joi.object({
  title: Joi.string().required(),
  messagetype: Joi.string().required(),
  mappingfield: Joi.string().required(),
  formid: Joi.string().hex().required(),
  subject: Joi.string(),
  to: Joi.array(),
  roleid: Joi.array(),
  content: Joi.string().required(),
  documenttemplate: Joi.array(),
  attachments: Joi.array(),
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
  sendcommunication,
  sendannouncement,
  sendsms,
  sendpushalert,
  sendemail
}

async function sendannouncement(req, res, next) {

  var recipients = req.body.recipients;
  var subject = req.body.subject;
  var content = req.body.content;
  var messagetype = req.body.type;
  var attachmenturl = req.body.attachment;
  var template = {}
  var branchid = req.body.branchid ? req.body.branchid: req.body.authkey.branchid._id;
  var branch = req.body.branchid ? req.body.branchid: req.body.authkey.branchid;

  if (attachmenturl=="no file") attachmenturl = undefined;  

  recipients.forEach(element => {

    content = common.regexrep(content, element, null, req.body.authkey.branchid);
    var receivers = [];    
    if (messagetype == "SMS" && element.mobile) {
      var smsnumber = element.mobile;
      receivers.push(element._id);
      sms.sendsms(content, smsnumber, template, receivers, branchid);
    }
    else if (messagetype == "EMAIL" && element.primaryemail) {       
      var message = {
        to: [element.primaryemail],
        subject: subject,
        content: content
      }
      receivers.push(element._id);
      email.sendcommunication(message, attachmenturl, template, receivers, branch);
    }
    else if (messagetype == "WHATSAPP" && element.whatsapp) {
      var whatsappnumbers = element.whatsapp;
      receivers.push(element._id);
      whatsapp.sendwhatsapp(content, whatsappnumbers, template, receivers, branchid);
    }
    else if (messagetype == "PUSHALERT") {      
      pushalerts.sendpushalert(element, content);
    }

  });
  if (req.body.activity) return;
  else res.json({ status: "success" })

}

async function sendcommunication(req, res, next) {
  var message = req.body.message;
  var messagetype = req.body.messagetype;
  var attachmenturl = req.body.attachmenturl;
  var template = req.body.template;
  var branchid = req.body.branchid ? req.body.branchid : req.body.authkey.branchid._id
  var branch = req.body.branchid ? req.body.branchid: req.body.authkey.branchid;

  var receiver = req.body.receiver;
  if (messagetype == "SMS") {
    var content = message.content;
    var smsnumber = req.body.message.to;
    sms.sendsms(content, smsnumber, template, receiver, branchid);
  }
  else if (messagetype == "EMAIL") {
    email.sendcommunication(message, attachmenturl, template, receiver, branch);
  }
  else if (messagetype == "WHATSAPP") {
    var content = message.content;
    var whatsappnumbers = req.body.message.to;
    whatsapp.sendwhatsapp(content, whatsappnumbers, template, receiver, branchid);
  }
  else if (messagetype == "PUSHALERT") {
    var memberid = req.body.memberid;
    var member;
    if (req.body.onMdel == "User") {
      member = await User.findById(memberid);
    }
    else {
      member = await Member.findById(memberid);
    }
    pushalerts.sendpushalert(member, message);
  }
  if (next=="GC") return;
  res.json({})

}

async function sendemail(req, res, next) {
  // var tomobile = req.body.tomobile;
  // var message = req.body.message;
  email.sendemailsib();
  return res.json("success");
}

async function sendsms(req, res, next) {
  var tomobile = req.body.tomobile;
  var message = req.body.message;
  sms.sendsms(message, tomobile);
  return res.json("success");
}

async function sendpushalert(req, res, next) {

  var member = await Member.findById(req.body.memberid);
  var usertype = req.body.usertype;
  var message = req.body.message;
  var member
  if (usertype == "Member") {
    member = await Member.findById(req.body.memberid);
  } else if (usertype == "User") {
    member = await User.findById(req.body.memberid);
  }
  pushalerts.sendpushalert(member, message);
  return res.json("success");

}


async function remove(Id, req) {
  var communication = await Communication.findById(Id);
  communication.status = "deleted"
  return await communication.save(req);
}

async function findbyId(Id) {
  return await Communication.findById(Id);
}

async function insert(req) {
  var communication = {
    title: req.body.title,
    messagetype: req.body.messagetype,
    formid: req.body.formid,
    subject: req.body.subject,
    to: req.body.to,
    roleid: req.body.roleid,
    content: req.body.content,
    attachments: req.body.attachments,
    property: req.body.property,
    mappingfield: req.body.mappingfield,
    documenttemplate : req.body,documenttemplate
  }
  await Joi.validate(communication, communicationSchema, { abortEarly: false });
  return await new Communication(communication).save(req);
}

async function update(Id, req) {
  var communication = await Communication.findById(Id);
  communication._original = communication.toObject();
  communication.title = req.body.title,
    communication.messagetype = req.body.messagetype,
    communication.formid = req.body.formid,
    communication.subject = req.body.subject,
    communication.to = req.body.to,
    communication.roleid = req.body.roleid,
    communication.content = req.body.content,
    communication.attachments = req.body.attachments,
    communication.property = req.body.property,
    communication.mappingfield = req.body.mappingfield,
    communication.documenttemplate = req.body.documenttemplate
  return await communication.save(req);
}

async function filter(params) {
  return await Communication.getbyfilter(params)
}

async function findcount(req) {
  return await Communication.findcount(req)
}

async function exportdata(params) {

  return await Communication.exportdata(params)
}
