// Download the helper library from https://www.twilio.com/docs/node/install
// Your Account Sid and Auth Token from twilio.com/console
// DANGER! This is insecure. See http://twil.io/secure
import Formdata from '../models/formdata.model';
import Communicationlog from '../models/communicationlog.model';
var axios = require("axios").default;


async function sendwhatsapp(
  message,
  whatsappnumber,
  template,
  receivers,
  branchid
) {

  if (WHATSAPP_CONFIG && whatsappnumber) {
    const accountSid = WHATSAPP_CONFIG.account_sid;
    const authToken = WHATSAPP_CONFIG.auth_token;
    const client = require("twilio")(accountSid, authToken);
    client.messages
      .create({
        from: WHATSAPP_CONFIG.twillio_number,
        body: message,
        to: "whatsapp:" + whatsappnumbers.e164Number,
      })
      .then((msg) => {

        return new Communicationlog({
          messagetype: "WHATSAPP",
          communicationid: template ? template._id : null,
          address: whatsappnumber,
          property: {
            message: msg
          },
          receivers: receivers,
          branchid: branchid,
        }).save().then();
      })
      .catch((e) => console.log(e))

  }
  else {

    var whatsapp_message = await checkintegration(branchid) //SMS_GATEWAY;
    var options = {
      method: 'POST',
      url: 'https://api.wassenger.com/v1/messages',
      headers: {
        'Content-Type': 'application/json',
        Token: whatsapp_message.property['token']
      },
      data: { phone: "+" + whatsappnumber, message: message }
    };
    axios.request(options).then(function (response) {
      console.log(response)
      new Communicationlog({
        messagetype: "WHATSAPP",
        communicationid: template ? template._id : null,
        address: whatsappnumber,
        property: {
          message: message
        },
        receivers: receivers,
        branchid: branchid,
      }).save().then()

    }).catch(function (error) {
      console.error(error);
    });

  }
}

async function checkintegration(branchid) {
  var whatsappgateway = await Formdata.findOne({ "property.whatsappgateway": true })
  return whatsappgateway;

}


export default { sendwhatsapp };
