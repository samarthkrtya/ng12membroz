var request = require('request');
var fs = require('fs');
import Communicationlog from '../models/communicationlog.model';
import Formdata from '../models/formdata.model';
var method = "GET"

async function checksmsgateway(message, smsnumber, branchid) {
  var smsgateway = await Formdata.findOne({ branchid: branchid, "property.smsgateway": true })
  if (smsgateway) {
    var prop = {} //smsgateway.property;
    var gateway = smsgateway.property["gatewayname"]

    switch (gateway) {
      case "ADDALK":
        if (smsnumber.length !== 11) smsnumber = '94' + smsnumber
        prop["msisdn"] = smsnumber,
        prop["channel"] = "1";
        prop["mt_port"] = "Fhiit";
        prop["msg"] = message;
        prop["s_time"] = "2022-03-24 08:00:00";
        prop["e_time"] = "2022-12-24 08:00:00";
        break;
      case "springedge":
        if (smsnumber.length <= 10) smsnumber = '91' + smsnumber;
        prop["gatewayname"] = 'springedge',
        prop["sender"] = smsgateway.property['sender'],
        prop["apikey"] = smsgateway.property['apikey']
        break;
      default:
      // code block
    }
    method = "POST"
    return prop;
  }
  else return null;

}

async function sendsms(message, smsnumber, template, receivers, branchid) {

  if (!smsnumber) return;
  var shortcode_regex = /\{(\w+)\}/g;
  // console.log("message", message)
  // console.log("message", encodeURIComponent(message))
  var sms_message = await checksmsgateway(message, smsnumber, branchid) //SMS_GATEWAY;
  if (!sms_message) {
    sms_message = SMS_GATEWAY
    if (smsnumber.length != 12) {
      smsnumber = "91" + smsnumber; // Add country code
    }
    var params = template && template.property ? template.property.params : [];

    params.forEach(param => {
      for (const property in param) {
        sms_message += "&"+ property + "=" + param[property]
      }

    });
    sms_message.replace(shortcode_regex, function (match, code) {

      if (code == 'message') {
        var str = message.replace(/&nbsp;/g, ' ')
        var str = encodeURIComponent(message.replace(/&nbsp;/g, ' '))
        sms_message = sms_message.replace("{" + code + "}", str);
      } else if (code == 'tomobile') {
        sms_message = sms_message.replace("{" + code + "}", smsnumber);
      }

    });
  }
  if (sms_message['gatewayname'] == "springedge") {
        //Usage
    var springedge = require('springedge');
    var params = {
      'sender': sms_message['sender'],
      'apikey': sms_message['apikey'],
      'to': [
        smsnumber
      ],
      'message': message,
      'format': 'json'
    };

    springedge.messages.send(params, 5000, function (err, response) {
      if (err) {
        return console.log(err);
      }
      console.log(response);
    });


  }
  else if (method == "GET") {

    //const message = encodeURI(sms_message);
    request(sms_message, function (error, response, body) {
      // //console.log('error:', error); // Print the error if one occurred
      // //console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
      //console.log('body:', body); // Print the HTML for the Google homepage.

      if (!error) {
        if (template)
          return new Communicationlog({
            messagetype: "SMS",
            communicationid: template ? template._id : null,
            address: smsnumber,
            property: {
              message: message
            },
            receivers: receivers,
            branchid: branchid,
          }).save().then()

      }
    });
  }
  else if (method == "POST") {

    request({
      method: "POST",
      json: true,
      url: 'https://digitalreachapi.dialog.lk/refresh_token.php',
      body: {
        "u_name": "Core04_API",
        "passwd": "Core04API@55555"
      }
    }, function (error, response, body) {

      request({
        method: "POST",
        json: true,
        headers: { 'Authorization': body.access_token, 'Content-Type': 'application/json', 'Accept': 'application/json' },
        url: 'https://digitalreachapi.dialog.lk/camp_req.php',
        body: sms_message
      }, function (error, response, body) {

        return new Communicationlog({
          messagetype: "SMS",
          communicationid: template ? template._id : null,
          address: smsnumber,
          property: {
            message: message
          },
          receivers: receivers,
          branchid: branchid,
        }).save().then()

      });

    })

  }

}

export default { sendsms };
