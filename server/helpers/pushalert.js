var request = require('request');
import Communicationlog from '../models/communicationlog.model';
import * as admin from 'firebase-admin';
const serviceAccount = require('../ioscertificate/vervitude-redefined-firebase-adminsdk-78osj-de0f7f57d9.json')
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

function sendpushalert(member, message, subject) {

  //console.log("member", member);

  if (member) {

    if (member.anroiddevices && member.anroiddevices.length !== 0) {
      member.anroiddevices.forEach(elementAndroidDevices => {
        if (
          elementAndroidDevices.registrationid &&
          elementAndroidDevices.registrationid != ""
        )
          sendoushalerttodevice(elementAndroidDevices.registrationid, message, subject, member)
      });
    }

    if (member.iosdevices && member.iosdevices.length !== 0) {
      member.iosdevices.forEach(elementIosDevices => {
        if (
          elementIosDevices.registrationid &&
          elementIosDevices.registrationid != ""
        )
          sendoushalerttoiosdevice(elementIosDevices.registrationid, message, subject, member)
      });
    }

  }

}

function sendpushalerts(members, message) {
  if (members && members.length !== 0) {
    members.forEach(element => {
      sendpushalert(element, message)
    });
  }
}


function sendoushalerttoiosdevice(registrationid, message, subject) {

  message = message.replace('&nbsp;', "")
  var rex = /(<([^>]+)>)/ig;
  message = message.replace(rex, "");

  if (registrationid) {

    // var note = new apn.Notification();
    // // The topic is usually the bundle identifier of your application.
    // note.expiry = Math.floor(Date.now() / 2000) + 3600; // Expires 1 hour from now.
    // note.sound = "default";
    // note.title = "Membroz";
    // note.body = message;
    // note.alert = message;
    // note.click_action = "FLUTTER_NOTIFICATION_CLICK";
    // note.content_available = true;
    // note.badge = 42;
    // note.payload = { 'messageFrom': 'Membroz' };
    // note.topic = IOS_TOPICS;

    console.log("registrationid", registrationid)
    // const message = {
    //   notification: {
    //     title: subject ? subject : "Vervitude",
    //     body: message,
    //     sound: "default"
    //   },
    //   priority: "high",
    //   token: registrationid
    // };

    let message = {
      notification: {
        title: subject ? subject : "Vervitude",
        body: message,
      },
      // Apple specific settings
      apns: {
        headers: {
          'apns-priority': '10',
        },
        payload: {
          aps: {
            sound: 'default',
          }
        },
      },
      token: registrationid
    };

    // Send a message to the device corresponding to the provided
    // registration token.
    admin.messaging().send(message)
      .then((response) => {
        // Response is a message ID string.
        console.log('Successfully sent message:', response);
      })
      .catch((error) => {
        console.log('Error sending message:', error);
      });
  }

}

function sendsilenctnotification(registrationid, message) {

  var registrationid = registrationid;
  message = message.replace('&nbsp;', "")

  var rex = /(<([^>]+)>)/ig;
  message = message.replace(rex, "");

  var form = {
    to: registrationid,
    data: {
      "title": "Membroz",
      "body": message,
      "click_action": "FLUTTER_NOTIFICATION_CLICK",
      "content_available": true,
      dashboard: ["calendar", "circular", "assignment", "examresult", "classschedule", "appointment", "booking"]
    }

  };

  var formData = JSON.stringify(form);
  request({
    headers: {
      'Content-Type': 'application/json',
      'Authorization': ANDROID_AUTHORIZATION_KEY
    },
    uri: 'https://fcm.googleapis.com/fcm/send',
    body: formData,
    method: 'POST'
  }, function (err, res, body) {
    //it works!    
    // //console.log(registrationid);
    // //console.log("Android notification has been successfully!!!" + ANDROID_AUTHORIZATION_KEY);
    //res.json({"notify": "Android notification has been successfully!!!"});
  });

}


function sendoushalerttodevice(registrationid, message, subject, receiver) {

  var registrationid = registrationid;
  message = message.replace('&nbsp;', "")

  var rex = /(<([^>]+)>)/ig;
  message = message.replace(rex, "");

  var form = {
    to: registrationid,
    priority: 'high',
    notification: {
      sound: 'default',
      title: subject ? subject : "Vervitude",
      body: message,
      content_available: true,
      data: {
        url: "app.membroz.com"
      }
    }
  };

  var formData = JSON.stringify(form);
  request({
    headers: {
      'Content-Type': 'application/json',
      'Authorization': ANDROID_AUTHORIZATION_KEY
    },
    uri: 'https://fcm.googleapis.com/fcm/send',
    body: formData,
    method: 'POST'
  }, function (err, res, body) {
    console.log(`err`, err);
    console.log("registrationid", registrationid);
    console.log("body", body);
    var json = JSON.parse(body)
    if (json.failure != 1) {
      return new Communicationlog({
        messagetype: "PUSHALERT",
        communicationid: null,
        //address: addresses,
        property: { message: message, subject: subject },
        receivers: receiver._id,
        branchid: receiver.branchid,
      }).save();
    }
    //  console.log("Android notification has been successfully!!!" + ANDROID_AUTHORIZATION_KEY);
  });

}


export default { sendpushalert, sendpushalerts, sendoushalerttodevice, sendsilenctnotification };