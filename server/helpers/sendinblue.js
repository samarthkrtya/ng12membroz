var SibApiV3Sdk = require('sib-api-v3-sdk');

var defaultClient = SibApiV3Sdk.ApiClient.instance;

// Configure API key authorization: api-key
var apiKey = defaultClient.authentications['api-key'];

// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//apiKey.apiKeyPrefix['api-key'] = "Token"

// Configure API key authorization: partner-key
// var partnerKey = defaultClient.authentications['partner-key'];
// partnerKey.apiKey = "YOUR API KEY"
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//partnerKey.apiKeyPrefix['partner-key'] = "Token"

function createContact(contact) {
  apiKey.apiKey = "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" //PROPERTY["sendgridapikey"];
  var apiInstance = new SibApiV3Sdk.ContactsApi();
  var createContact = new SibApiV3Sdk.CreateContact(); // CreateContact | Values to create a contact
  createContact.email = contact.property.primaryemail;

  apiInstance.createContact(createContact).then(function (data) {
    addContactToList(contact);
  }, function (error) {
    //console.log(error);
    return;
  });

}


function addContactToList(contact) {
  apiKey.apiKey = "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" //PROPERTY["sendgridapikey"];
  var apiInstance = new SibApiV3Sdk.ListsApi();
  var contactEmails = new SibApiV3Sdk.AddContactToList();

  var listId = contact.property.listid
  contactEmails.emails = [contact.property.primaryemail];
  //console.log("listId", listId)
  apiInstance.addContactToList(listId, contactEmails).then(
    function (data) {
      return contact;
    },
    function (error) {
      //console.error(error);
      return;
    }
  );

}

export default { createContact }
