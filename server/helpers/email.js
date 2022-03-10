var fs = require('fs');
var path = require("path");
import Communicationlog from '../models/communicationlog.model';
const sgMail = require('@sendgrid/mail');

var SibApiV3Sdk = require('sib-api-v3-sdk');
var defaultClient = SibApiV3Sdk.ApiClient.instance;
var apiKey = defaultClient.authentications['api-key'];

function sendemail(message, emails, template, receivers, branch, attachmenturl) {

  apiKey.apiKey = PROPERTY["sendgridapikey"];
  var emailalias = PROPERTY["emailalias"] ? PROPERTY["emailalias"] : "Membroz - Manage Membership";
  var apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  var sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail(); // SendSmtpEmail | Values to send a transactional email

  if (emails.length == 0) return;
  if (!template) template = {}

  // from email
  if (template.from) {
    template.from = template.from;
  }
  else if (!template.from && branch.property.from) {
    template.from = branch.property.from;
  }
  else if (!template.from && !branch.property.from && FROM_EMAILS) {
    template.from = FROM_EMAILS;
  }
  else {
    template.from = "contact@membroz.com"
  }

  // replyto email
  if (template.replyto) {
    template.replyTo = template.replyto;
  }
  else if (!template.replyto && branch.property.replyto) {
    template.replyTo = branch.property.replyto;
  }
  else if (!template.replyto && !branch.property.replyto && REPLY_EMAILS) {
    template.replyTo = REPLY_EMAILS;
  }
  else {
    template.replyTo = template.from;
  }

  sendSmtpEmail.sender = { "email": template.from, "name": emailalias };
  sendSmtpEmail.replyTo = { "email": template.replyTo, "name": emailalias };
  var tolist = [];
  var addresses = ''
  emails.forEach(element => {
    if (element) {
      addresses += element + ','
      tolist.push({ "email": element })
    }
  });
  if (tolist.length == 0) return;
  sendSmtpEmail.to = tolist;
  sendSmtpEmail.htmlContent = message;
  sendSmtpEmail.subject = template.subject
  if (attachmenturl) {

    var attachment_name = attachmenturl.substring(attachmenturl.lastIndexOf('/') + 1);
    var request = require('request').defaults({ encoding: null });
    request.get(attachmenturl, function (error, response, body) {
      if (!error && response.statusCode == 200) {

        sendSmtpEmail.attachment = [{
          name: attachment_name,
          content: new Buffer(body).toString('base64')
        }]

        apiInstance.sendTransacEmail(sendSmtpEmail).then((body) => {

          new Communicationlog({
            messagetype: "EMAIL",
            communicationid: template ? template._id : null,
            address: addresses,
            property: {
              message: sendSmtpEmail.htmlContent,
              subject: sendSmtpEmail.subject
            },
            receivers: receivers,
            branchid: branch._id,
          }).save().then();
        })
          .catch(error => {
            console.log(error)
          })
      }
    });

  }
  else {

    apiInstance.sendTransacEmail(sendSmtpEmail).then((body) => {
      new Communicationlog({
        messagetype: "EMAIL",
        communicationid: template ? template._id : null,
        address: addresses,
        property: {
          message: sendSmtpEmail.htmlContent,
          subject: sendSmtpEmail.subject
        },
        receivers: receivers,
        branchid: branch._id,
      }).save().then();

    });

  }

}

function sendcommunication(message, attachmenturl, template, receivers, branch) {

  apiKey.apiKey = PROPERTY["sendgridapikey"];
  var emailalias = PROPERTY["emailalias"] ? PROPERTY["emailalias"] : "Membroz - Manage Membership";
  var apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  var sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail(); // SendSmtpEmail | Values to send a transactional email
  var tolist = [];
  var cclist = [];
  var addresses = ''

  if (message.to && Array.isArray(message.to)) {
    message.to.forEach(element => {
      if (element) {
        addresses += element + ','
        tolist.push({ "email": element })
      }
    });
  }
  else {
    addresses = message.to
    tolist.push({ "email": message.to })
  }

  if (message.cc)
    message.cc.forEach(element => {
      cclist.push({ "email": element })
    });
  if (message.to.length == 0) return;
  if (!template) template = {}

  if (template.from) {
    template.from = template.from;
  }
  else if (!template.from && branch.property.from) {
    template.from = branch.property.from;
  }
  else if (!template.from && !branch.property.from && FROM_EMAILS) {
    template.from = FROM_EMAILS;
  }
  else {
    template.from = "contact@membroz.com"
  }

  if (template.replyto) {
    template.replyTo = template.replyto;
  }
  else if (!template.replyto && branch.property.replyto) {
    template.replyTo = branch.property.replyto;
  }
  else if (!template.replyto && !branch.property.replyto && REPLY_EMAILS) {
    template.replyTo = REPLY_EMAILS;
  }
  else {
    template.replyTo = template.from;
  }
  
  if (tolist.length == 0) return;
  sendSmtpEmail.to = tolist;
  if (cclist.length > 0) sendSmtpEmail.cc = cclist;
  sendSmtpEmail.sender = { "email": template.from, "name": emailalias };
  sendSmtpEmail.replyTo = { "email": template.replyTo, "name": emailalias };
  sendSmtpEmail.htmlContent = message.content;
  sendSmtpEmail.subject = message.subject;
  if (message.attachmentblob) {
    sendSmtpEmail.attachment = [{
      name: "attachment.pdf",
      content: new Buffer(message.attachmentblob.data).toString('base64')
    }]
    //console.log("message.attachmentblob", message.attachmentblob)
  }

  if (attachmenturl) {

    var attachment_name = attachmenturl.substring(attachmenturl.lastIndexOf('/') + 1);
    var request = require('request').defaults({ encoding: null });
    request.get(attachmenturl, function (error, response, body) {
      if (!error && response.statusCode == 200) {

        sendSmtpEmail.attachment = [{
          name: attachment_name,
          content: new Buffer(body).toString('base64')
        }]

        apiInstance.sendTransacEmail(sendSmtpEmail).then(() => {

          new Communicationlog({
            messagetype: "EMAIL",
            communicationid: template ? template._id : null,
            address: addresses,
            property: {
              message: sendSmtpEmail.htmlContent,
              subject: sendSmtpEmail.subject
            },
            receivers: receivers,
            branchid: branch._id,
          }).save().then();

        });
      }
    });

  }
  else {

    apiInstance.sendTransacEmail(sendSmtpEmail).then(function (body) {

      new Communicationlog({
        messagetype: "EMAIL",
        communicationid: template ? template._id : null,
        address: addresses,
        property: {
          message: sendSmtpEmail.htmlContent,
          subject: sendSmtpEmail.subject
        },
        receivers: receivers,
        branchid: branch._id,
      }).save().then();
    }, function (error) {
      console.error(error);
    });

  }

}

function sendcommunicationses(message, attachmenturl, template, receivers, branchid) {

  const AWS = require('aws-sdk');

  const SES_CONFIG = {
    accessKeyId: 'AKIA42DBVBICBDAMOJRA',
    secretAccessKey: '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',
    region: 'us-east-2',
  };

  const AWS_SES = new AWS.SES(SES_CONFIG);

  let sendEmail = (recipientEmail, name) => {
    let params = {
      Source: 'contact@membroz.com',
      Destination: {
        ToAddresses: [
          "jariwbh@krtya.com",
          "jariwbh@gmail.com"
        ],
      },
      ReplyToAddresses: [],
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: 'This is the body of my email! Un subscribed here {{amazonSESUnsubscribeUrl}}',
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: `Hello, ${name}!`,
        }
      },
    };
    return AWS_SES.sendEmail(params).promise();
  };
  sendEmail('', '');

}

function sendemailmerg(message, attachments, emails, template, receivers, branch) {

  apiKey.apiKey = PROPERTY["sendgridapikey"];
  var emailalias = PROPERTY["emailalias"] ? PROPERTY["emailalias"] : "Membroz - Manage Membership";
  var apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  var sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail(); // SendSmtpEmail | Values to send a transactional email
  var addresses = '';
  if (emails.length == 0) return;
  if (!template) template = {}

  if (template.from) {
    template.from = template.from;
  }
  else if (!template.from && branch.property.from) {
    template.from = branch.property.from;
  }
  else if (!template.from && !branch.property.from && FROM_EMAILS) {
    template.from = FROM_EMAILS;
  }
  else {
    template.from = "contact@membroz.com"
  }

  if (template.replyto) {
    template.replyTo = template.replyto;
  }
  else if (!template.replyto && branch.property.replyto) {
    template.replyTo = branch.property.replyto;
  }
  else if (!template.replyto && !branch.property.replyto && REPLY_EMAILS) {
    template.replyTo = REPLY_EMAILS;
  }
  else {
    template.replyTo = template.from;
  }

  sendSmtpEmail.sender = { "email": template.from, "name": emailalias };
  sendSmtpEmail.replyTo = { "email": template.replyTo, "name": emailalias };

  var tolist = [];
  emails.forEach(element => {
    addresses += element + ','
    tolist.push({ "email": element })
  });

  sendSmtpEmail.to = tolist;
  sendSmtpEmail.htmlContent = message;
  sendSmtpEmail.subject = template.subject
  sendSmtpEmail.attachment = [];
  attachments.forEach(attachment => {

    var body = fs.readFileSync(attachment);
    var attachment_name = path.basename(attachment);

    sendSmtpEmail.attachment.push({
      name: attachment_name,
      content: new Buffer(body).toString('base64')
    })

  });

  attachments.forEach(attachment => {
    if (fs.existsSync(attachment)) {
      fs.unlink(attachment, function (err) {
        if (err) throw err;
        console.log('PDF file deleted!');
      });
    }
  })

  apiInstance.sendTransacEmail(sendSmtpEmail).then((err) => {
    if (template) {
      new Communicationlog({
        messagetype: "MAILMERGE",
        communicationid: template ? template._id : null,
        address: addresses,
        property: {
          message: sendSmtpEmail.htmlContent,
          attachments: sendSmtpEmail.attachment.length,
          subject: sendSmtpEmail.subject
        },
        receivers: receivers,
        branchid: branch._id
      }).save().then();
    }
  });

}

export default { sendcommunication, sendemail, sendemailmerg, sendcommunicationses };
