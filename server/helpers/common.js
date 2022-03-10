"use strict";
import mongoose from 'mongoose';
import async from "async";
import Activity from '../models/activity.model';
import Branch from '../models/branch.model';
import email from '../helpers/email';
import sms from '../helpers/sms';
import pushalert from '../helpers/pushalert';
import whatsapp from '../helpers/whatsapp';
import PizZip from 'pizzip';
import puppetter from '../helpers/puppetter';
import Docxtemplater from 'docxtemplater';
import fs from 'fs';
const moment = require('moment');
var ObjectID = require('mongodb').ObjectID;


module.exports = {
  generatequery,
  generateselect,
  generateselect2,
  getreffields,
  generaterefselect,
  refformfields,
  getmatches,
  regexrep,
  generatereportquery,
  generateobject,
  updatesaledetail,
  updatepurchasedetail,
  workflowcriteria,
  createactivity,
  convertotimezonedate,
  connecttocall,
  getfilterbyref,
  convertolocaltime
}

function convertotimezonedate(date, branch) {
  date = new Date(date);
  var options = {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    timeZone: branch.timezone,
    dateStyle: 'short',
    timeStyle: 'long'
  };
  var locale = branch.locale ? branch.locale : "en-US";
  //var date1 = new Intl.DateTimeFormat(locale, options).format(date);
  return new Date(date);

} 

function generateobject(action, history, original, diff, req, branch) {
  // console.log("diff", diff)
  // console.log("obj 2", original)
  var flattenObject = function (ob) {
    var toReturn = {};
    for (var i in ob) {
      if (!ob.hasOwnProperty(i)) continue; 

      if (i.toString() == "_bsontype") continue;

      if (i.toString() == "id" && (typeof ob[i]) == 'object') {
        //console.log("ob[i].length", ob[i].length)
        if (ob[i] && ob[i].length)
          toReturn[i] = ObjectID(ob[i]).toString();
        continue;
      }

      if ((typeof ob[i]) == 'object') {
        var flatObject = flattenObject(ob[i]);

        if (Object.keys(flatObject).length === 0 && flatObject.constructor === Object) {
          toReturn[i] = ob[i];
        }

        for (var x in flatObject) {
          if (!flatObject.hasOwnProperty(x)) continue;
          if (x == "id") {
            toReturn[i] = flatObject[x];
          }
          else {
            toReturn[i + '.' + x] = flatObject[x];
          }
        }
      } else {
        toReturn[i] = ob[i];
      }
    }
    ////console.log("toReturn", toReturn)
    return toReturn;
  };
  //console.log("original", original);
  var obj = flattenObject(original);
  processworkflowlogtask(action, original, diff, req, branch);
  processworkflowlogwebhook(action, original, diff, req, branch);
  processworkflowlogupdatetask(action, original, diff, req, branch);
  processworkflowlogsms(action, obj, history, branch);
  processworkflowlogwhatsapp(action, obj, history, branch);
  processworkflowlogemail(action, original, obj, history, branch);
  processworkflowlogpushalert(action, obj, original, branch);
  // processworkflowlogmailmerge(action, original, obj, history, branch);
  processworkflowlogemailmergefile(action, original, obj, history, branch);

}

function processworkflowlogpushalert(action, obj, original, branch) {

  if (action && action.notification) {

    var notifications = action.notification;
    async.forEachSeries(notifications, (t, next) => {
      if (t.messagetype == "NOTIFICATION") {
        var str = regexrep(t.content, obj, refobj, branch)
        var field = t.mappingfield;
        var refobj = original[field];
        pushalert.sendpushalert(refobj, str, t.subject);
        next();
      }

    })

  }

}

function processworkflowlogupdatetask(action, original, diff, req, branch) {
  // console.log("processworkflowlogupdatetask", action.updatetasks)
  // console.log("original", original)
  if (action && action.updatetasks) {

    var tasks = action.updatetasks;
    async.forEachSeries(tasks, (t, next) => {
      var query = {
        templateid: t._id,
        customerid: original.assignuserid ? original.assignuserid._id : null,
        "$or": [{ assingeeuser: req.body.authkey._id },
        { "assingeerole": { $size: { "$gt": 1 } }, assingeerole: req.body.authkey.role._id }],
        status: "active"
      }
      Activity.findOne(query)
        .then((activity) => {
          if (activity) {
            activity.status = "completed";
            activity.save(req).then();
          }

        })
      next();

    })

  } 

}


function processworkflowlogwebhook(action, original, diff, req, branch) {
  // console.log("processworkflowlogwebhook")
  if (action && action.webhooks) {

    var webhooks = action.webhooks;
    //console.log(action)
    async.forEachSeries(webhooks, (webhook, next) => {
      //console.log(webhook)
      const axios = require('axios')
      var url = webhook.property.api;
      var mapping =   webhook.property.mapping;
      var newobject = {}
      //console.log("mapping", mapping)
      for (const prop in mapping) {
        var property = mapping[prop].split(".");
        //console.log(property);
        if (property.length > 1) {
          newobject[prop] = original[property[0]][property[1]];
        }
        else {
          newobject[prop] = original[mapping[prop]]
        }
      }
      newobject.memberid = original._id;
      axios.post(url, newobject)
        .then((res1) => {                
          next()
        })
        .catch((error) => {
        //  console.error(error)
        })
      
      })

  }

}

function processworkflowlogtask(action, original, diff, req, branch) {
  //console.log("processworkflowlogtask", action.tasks)
  if (action && action.tasks) {

    var tasks = action.tasks;

    async.forEachSeries(tasks, (t, next) => {
      var duedate = new Date();
      var adddays = parseInt(t.duedate["dueday"]);
      duedate.setDate(duedate.getDate() + adddays);

      var mappingfield = t.mappingfield;
      var users = t.assingeeuser ? t.assingeeuser : [];
      if (mappingfield) {
        mappingfield = mappingfield.split(".")
        // console.log("mappingfield", mappingfield)
        // console.log("diff", diff)
        if (mappingfield.length == 1 && diff[mappingfield]) {
          users = users.concat(diff[mappingfield]);
        }
        else if (diff[mappingfield[0]][mappingfield[1]]) {
          if (diff[mappingfield[0]][mappingfield[1]] && Array.isArray(diff[mappingfield[0]][mappingfield[1]])) {
            users = users.concat(diff[mappingfield[0]][mappingfield[1]]);
          }
          else {
            users = users.push(diff[mappingfield[0]][mappingfield[1]]);
          }
        }

      }
      var formname = t.formid.formname;
      var onmodel = t.formid.schemaname == "formdatas" ? "Formdata" : titleCase(formname);
      users.forEach((user) => {

        var activity = {
          description: t.content,
          priority: t.priority,
          type: "task",
          templateid: t._id,
          customerid: req.body.authkey._id,
          onModel: "User",
          branchid: original.branchid,
          dispositionid: t.dispositionid,
          refid: original._id,
          onRefModel: onmodel,
          assingeeuser: user,
          assingeerole: t.assingeerole,
          duedate: duedate,
          notes: t.notes
        }
        new Activity(activity).save(req)

      })

      var mappingfieldrole = t.mappingfieldrole;
      var roles = t.assingeerole ? t.assingeerole : [];

      if (mappingfieldrole) {
        mappingfieldrole = mappingfieldrole.split(".")
        // console.log("mappingfield", mappingfield)
        // console.log("diff", diff)
        if (mappingfieldrole.length == 1 && diff[mappingfieldrole]) {
          // console.log("diff[mappingfieldrole]", diff[mappingfieldrole])
          roles = roles.concat(diff[mappingfieldrole]);
        }

      }
      //console.log(roles)
      var formname = t.formid.formname;
      var onmodel = t.formid.schemaname == "formdatas" ? "Formdata" : titleCase(formname);
      roles.forEach((role) => {

        var activity = {
          description: t.content,
          priority: t.priority,
          type: "task",
          templateid: t._id,
          customerid: req.body.authkey._id,
          onModel: "User",
          branchid: original.branchid,
          dispositionid: t.dispositionid,
          refid: original._id,
          onRefModel: onmodel,
          assingeerole: role,
          duedate: duedate,
          notes: t.notes
        }
        //console.log("activity", activity)
        new Activity(activity).save(req)

      })


    })

  }

}

function nullGetter(part, scopeManager) {
  /*
      If the template is {#users}{name}{/} and a value is undefined on the
      name property:

      - part.value will be the string "name"
      - scopeManager.scopePath will be ["users"] (for nested loops, you would have multiple values in this array, for example one could have ["companies", "users"])
      - scopeManager.scopePathItem will be equal to the array [2] if
        this happens for the third user in the array.
      - part.module would be empty in this case, but it could be "loop",
        "rawxml", or or any other module name that you use.
  */

  if (!part.module) {
    // part.value contains the content of the tag, eg "name" in our example
    // By returning '{' and part.value and '}', it will actually do no replacement in reality. You could also return the empty string if you prefered.
    return '{' + part.value + '}';
  }
  if (part.module === "rawxml") {
    return "";
  }
  return "";
}

// function updatetimezonedate(object, branch) {
//   for (const property in object) {
//     let xdate = new Date(object[property]);    
//     if (xdate instanceof Date && Object.prototype.toString.call(object[property]) === '[object Date]') {
//       var now = moment();
//       var clientOffset = now.tz(branch.timezone).utcOffset();
//       xdate.setUTCMinutes(xdate.getUTCMinutes() + clientOffset);
//       xdate.setUTCHours(0, 0, 0, 0);
//       object[property] = xdate.toDateString();
//     }
//   }
// }

// function processworkflowlogmailmerge(action, original, obj, history, branch) {
//   //console.log("original");
//   // console.log("processworkflowlogmailmerge");
//   var template_obj = obj;

//   var startingnumber = branch.property ? branch.property["serial_number"] : "";
//   if (startingnumber) {
//     var numbers = startingnumber.match(/\d+/g).map(Number);
//     if (!numbers) lastmember = "MEMBROZ10000"
//     if (numbers && numbers.length > 0) {
//       var element = numbers[numbers.length - 1];
//       var newnumber = parseInt(element) + 1;
//       template_obj['serial_number'] = startingnumber.replace(element, newnumber)
//     }
//   }
//   if (action.mailmerge && action.mailmerge.length > 0) {

//     async.forEachSeries(action.mailmerge, (t, next) => {

//       if (t.messagetype == "MAILMERGE") {

//         let path = t.attachments;
//         if (Array.isArray(t.attachments)) {
//           path = t.attachments[0]
//         }

//         let new_filename = ObjectID() + '.' + path.split('.').pop();
//         if (!fs.existsSync("./uploads/")) fs.mkdirSync("./uploads/")
//         let file = fs.createWriteStream("./uploads/" + new_filename);

//         if (path.indexOf("https") > -1) {
//           var http = require("https");
//         } else {
//           var http = require("http");
//         }

//         http.get(path, response => {

//           var stream = response.pipe(file);
//           stream.on('finish', function () {

//             const InspectModule = require("docxtemplater/js/inspect-module");
//             const iModule = InspectModule();

//             var content = fs.readFileSync('./uploads/' + new_filename, 'binary');
//             var zip = new PizZip(content);
//             var doc;
//             try {
//               doc = new Docxtemplater(zip, { nullGetter: nullGetter, modules: [iModule] });
//               const tags = iModule.getAllTags();
//               // console.log(tags);
//             } catch (error) {
//               // Catch compilation errors (errors caused by the compilation of the template : misplaced tags)
//               // errorHandler(error);
//               //console.log(error)
//             }
//             //console.log("setData 1", template_obj)
//             updatetimezonedate(template_obj, branch)
//             //console.log("setData 2", template_obj)
//             doc.setData(template_obj);
//             try {
//               // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
//               doc.render()
//             }
//             catch (error) {
//               var e = {
//                 message: error.message,
//                 name: error.name,
//                 stack: error.stack,
//                 properties: error.properties,
//               }
//               // ////console.log(JSON.stringify({error: e}));
//               // The error thrown here contains additional information when logged with JSON.stringify (it contains a property object).
//               throw error;
//             }
//             var buf = doc.getZip().generate({ type: 'nodebuffer' });
//             var new_word = ObjectID()

//             fs.writeFileSync('./uploads/' + new_word + '.docx', buf);

//             if (fs.existsSync('./uploads/' + new_filename)) {
//               fs.unlink('./uploads/' + new_filename, function (err) {
//                 if (err) throw err;
//                 // if no error, file has been deleted successfully
//                 // ////console.log('Word template deleted');
//               });
//             }

//             var docxConverter = require('docx-pdf');

//             // var office2pdf = require('office2pdf'),
//             // generatePdf = office2pdf.generatePdf;

//             // generatePdf("./uploads/"+new_word+".docx", function(err, result) {

//             docxConverter("./uploads/" + new_word + ".docx", "./uploads/" + new_word + ".pdf", function (err, result) {

//               var fieldnameforEmail = "property.primaryemail";

//               var emailToLists = [];
//               var emailLists = {};
//               var receiverLists = [];

//               const User = require('../models/user.model');
//               User.find({ "_id": { "$in": t.to } })
//                 .then((toEmail) => {

//                   if (!toEmail || toEmail.length == 0) return null;
//                   toEmail.map((user) => receiverLists.push(user._id));

//                   var value = regemail(
//                     toEmail,
//                     fieldnameforEmail,
//                     emailToLists
//                   );

//                   return value;
//                 })
//                 .then((value) => {
//                   if (!value) emailLists = { to: [] };

//                   var field = t.mappingfield;
//                   var receiverLists = [];

//                   var mappingfieldvalue = ""

//                   if (field == "_id") {
//                     mappingfieldvalue = fieldnameforEmail;
//                     receiverLists.push(obj._id);
//                   }
//                   else {
//                     mappingfieldvalue = field + "." + fieldnameforEmail;
//                     receiverLists.push(obj[field + "._id"]);
//                   }

//                   mappingfieldvalue = obj[mappingfieldvalue];

//                   var str = regexrep(
//                     t.content,
//                     obj,
//                     history,
//                     branch
//                   );
//                   var attachment = "./uploads/" + new_word + ".pdf";
//                   t.subject = regexrep(
//                     t.subject,
//                     obj,
//                     history,
//                     branch
//                   );

//                   emailLists = [mappingfieldvalue]

//                   if (value) {
//                     email.sendemailmerg(
//                       str,
//                       attachment,
//                       value,
//                       t,
//                       receiverLists,
//                       branch._id
//                     );
//                     console.log(value)
//                   }

//                   email.sendemailmerg(
//                     str,
//                     attachment,
//                     emailLists,
//                     t,
//                     receiverLists,
//                     branch._id
//                   );
//                   console.log("Emaillist Marge", emailLists)
//                   if (fs.existsSync("./uploads/" + new_word + ".docx")) {
//                     fs.unlink("./uploads/" + new_word + ".docx", function (err) {
//                       if (err) throw err;
//                       console.log('Word file deleted!');
//                     });
//                   }

//                 });

//             });

//             if (template_obj['serial_number']) {
//               Branch.findOneAndUpdate({ _id: branch._id }, { "$set": { "property.serial_number": template_obj['serial_number'] } }).then()
//             }

//           });

//         });

//         next()
//       }

//     })
//   }
// }

function processworkflowlogemailmergefile(action, original, obj, history, branch) {

  console.log("processworkflowlogemailmergefile")

  var startingnumber = branch.property ? branch.property["serial_number"] : "";
  if (startingnumber) {
    var numbers = startingnumber.match(/\d+/g).map(Number);
    if (!numbers) lastmember = "MEMBROZ10000"
    if (numbers && numbers.length > 0) {
      var element = numbers[numbers.length - 1];
      var newnumber = parseInt(element) + 1;
      obj['serial_number'] = startingnumber.replace(element, newnumber)
    }
  }

  if (action.mailmerge && action.mailmerge.length > 0) {

    async.forEachSeries(action.mailmerge, async (t, next) => {

      var emailToLists = [];
      var emailLists = {};
      var receiverLists = [];

      if (t.messagetype == "MAILMERGE" && t.documenttemplate) {
        var fieldnameforEmail = "property.primaryemail";

        if (t.documenttemplate && t.documenttemplate.length > 0) {

          var attachments = [];
          async.forEachSeries(t.documenttemplate, async (elementTemplate, attachmentnext) => {

            var document = regexrep(elementTemplate, obj, history, branch);
            var attachment = await puppetter.generateMergePdf(document);
            attachments.push(attachment);
            attachmentnext();

          }, function () {

            const User = require('../models/user.model');
            User.find({ "_id": { "$in": t.to } })
              .then((toEmail) => {
                if (!toEmail || toEmail.length == 0) return null;
                toEmail.map((user) => receiverLists.push(user._id));
                var value = regemail(toEmail, fieldnameforEmail, emailToLists);
                return value;
              })

              .then((value) => {
                if (!value) emailLists = { to: [] };

                var field = t.mappingfield;
                var receiverLists = [];
                var mappingfieldvalue = ""

                if (field == "_id") {
                  mappingfieldvalue = fieldnameforEmail;
                  receiverLists.push(obj._id);
                }
                else {
                  mappingfieldvalue = field + "." + fieldnameforEmail;
                  receiverLists.push(obj[field + "._id"]);
                }

                mappingfieldvalue = obj[mappingfieldvalue];
                var str = regexrep(t.content, obj, history, branch);
                t.subject = regexrep(t.subject, obj, history, branch);
                emailLists = [mappingfieldvalue]
                
                if (value) {
                  emailLists = emailLists.concat(value);
                  email.sendemailmerg(str, attachments, emailLists, t, receiverLists, branch);
                  console.log("Emaillist & CC Merge", emailLists)
                }
                else {
                  email.sendemailmerg(str, attachments, emailLists, t, receiverLists, branch);
                  console.log("Emaillist Merge", emailLists)
                }
              });

            if (obj['serial_number']) {
              Branch.findOneAndUpdate({ _id: branch._id }, { "$set": { "property.serial_number": obj['serial_number'] } }).then()
            }
          });
        }
        next()
      }

    })
  }
}

function regexrep(str, obj, history, branch) {

  //var shortcode_regex = /\[{(\w+)+\.?(\w+)\}]/mg;
  var shortcode_regex = /\[{.*?\}]/mg; // Changes in REGEX
  if (!str) return str;
  var currency = branch.currency ? branch.currency : "USD";
  var locale = branch.locale ? branch.locale : "en-US";

  str.replace(shortcode_regex, function (match, code) {

    var replace_str = match.replace('[{', '');
    replace_str = replace_str.replace('}]', '');
    var datatype;
    if (replace_str.startsWith("DATE@")) {
      datatype = "Date";
      replace_str = replace_str.substring("DATE@".length)
    } else if (replace_str.startsWith("DATESTRING@")) {
      datatype = "Datestring"
      replace_str = replace_str.substring("DATESTRING@".length)
    } else if (replace_str.startsWith("CURRENCY@")) {
      datatype = "Currency"
      replace_str = replace_str.substring("CURRENCY@".length)
    }
    else if (replace_str.startsWith("DATETIME@")) {
      datatype = "Datetime"
      replace_str = replace_str.substring("DATETIME@".length)
    }
    else if (replace_str.startsWith("TIME@")) {
      datatype = "Time"
      replace_str = replace_str.substring("TIME@".length)
    }

    if (!datatype) datatype = "text";
    var db_fieldValue = obj[replace_str];

    if (datatype && datatype.toLowerCase() == "currency") {
      db_fieldValue = new Intl.NumberFormat(locale, { style: 'currency', currency: currency }).format(db_fieldValue);
    }
    else if (datatype && datatype.toLowerCase() == "date") {
      var options = {
        timeZone: branch.timezone
      };
      db_fieldValue = new Intl.DateTimeFormat(locale, options).format(db_fieldValue)
    }
    else if (datatype && datatype.toLowerCase() == "datestring") {
      var options = {
        timeZone: branch.timezone,
        dateStyle: 'long'
      };
      db_fieldValue = new Intl.DateTimeFormat(locale, options).format(db_fieldValue)
    }
    else if (datatype && datatype.toLowerCase() == "datetime") {
      var options = {
        year: 'numeric', month: 'numeric', day: 'numeric',
        hour: 'numeric', minute: 'numeric', second: 'numeric',
        timeZone: branch.timezone
      };
      db_fieldValue = new Intl.DateTimeFormat(locale, options).format(db_fieldValue)
    }
    else if (db_fieldValue && datatype.toLowerCase() == "time") {
      var db_fieldValue = new Date(db_fieldValue);
      var options = {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        timeZone: branch.timezone,
      };
      db_fieldValue = new Intl.DateTimeFormat(locale, options).format(db_fieldValue)
    }
    if (replace_str == "WEBURL") db_fieldValue = WEBURL;

    if (datatype == "Currency") {
      replace_str = "CURRENCY@" + replace_str;
    }
    else if (datatype == "Date") {
      replace_str = "DATE@" + replace_str;
    }
    else if (datatype == "Datestring") {
      replace_str = "DATESTRING@" + replace_str;
    }
    else if (datatype == "Datetime") {
      replace_str = "DATETIME@" + replace_str;
    }
    else if (datatype == "Time") {
      replace_str = "TIME@" + replace_str;
    }

    if (db_fieldValue) {
      str = str.replace("$[{" + replace_str + "}]", db_fieldValue);
    }
    else {
      var fieldnameSplit = replace_str.split('.');

      if (replace_str.startsWith("branchid")) {

        if (fieldnameSplit.length == 2 && branch[fieldnameSplit[1]]) {
          db_fieldValue = branch[fieldnameSplit[1]]
        }
        else if (fieldnameSplit.length == 3 && branch[fieldnameSplit[1]]) {
          db_fieldValue = branch[fieldnameSplit[1]][fieldnameSplit[2]]
        }
        if (db_fieldValue) {
          str = str.replace("$[{" + replace_str + "}]", db_fieldValue);
        }
        else {
          str = str.replace("$[{" + replace_str + "}]", "");
        }
      }
      var fieldname1 = fieldnameSplit[0];
      if (history && history[fieldname1] && fieldnameSplit.length == 1) {
        db_fieldValue = history[fieldname1];
      }
      else if (!db_fieldValue && fieldnameSplit.length == 2 && branch[fieldnameSplit[1]]) {
        db_fieldValue = branch[fieldnameSplit[1]]
      }
      if (db_fieldValue) {
        str = str.replace("$[{" + replace_str + "}]", db_fieldValue);
      }
      else {
        str = str.replace("$[{" + replace_str + "}]", "");
      }

    }

  });

  return str;

}

function replacetinyurl(str, obj) {

  var substring = str.substring(str.indexOf("##TINYURL"));
  var subvar = substring.indexOf("]##")
  var consturl = substring.substring(0, subvar + 3);
  var newurl = substring.substring(10, subvar);

  async function generatetinyurl(url) {
    // https://app.bitly.com/ UserID - membroz Pwd - pass#123
    const response = await bitly.shorten(url);
    return response;
  }


  return generatetinyurl(newurl).then((bitlyurl) => {
    return str.replace(consturl, bitlyurl.link);
  })

}


function regsms(ccSMS, fieldnameforMobile, smsLists) {

  ccSMS.forEach(element => {
    var db_fieldValue_CC;
    var fieldnameSplit_CC = fieldnameforMobile.split('.');
    if (fieldnameSplit_CC[1] == undefined || fieldnameSplit_CC[1] == null) {
      var fieldname1_CC = fieldnameSplit_CC[0];
      db_fieldValue_CC = element[fieldname1_CC];
    } else {

      var fieldname1_CC = fieldnameSplit_CC[0];
      var fieldname2_CC = fieldnameSplit_CC[1];
      db_fieldValue_CC = element[fieldname1_CC][fieldname2_CC];
    }
    if (db_fieldValue_CC && db_fieldValue_CC !== '') {
      smsLists.push(db_fieldValue_CC);
    }
  });
  return smsLists;

}

function regemail(ccEmail, fieldnameforEmail, emailLists) {

  ccEmail.forEach(element => {
    var db_fieldValue_CC;
    var fieldnameSplit_CC = fieldnameforEmail.split('.');

    if (fieldnameSplit_CC[1] == undefined || fieldnameSplit_CC[1] == null) {
      var fieldname1_CC = fieldnameSplit_CC[0];
      db_fieldValue_CC = element[fieldname1_CC];
    } else {

      var fieldname1_CC = fieldnameSplit_CC[0];
      var fieldname2_CC = fieldnameSplit_CC[1];
      db_fieldValue_CC = element[fieldname1_CC][fieldname2_CC];
    }
    if (db_fieldValue_CC && db_fieldValue_CC !== '') {
      emailLists.push(db_fieldValue_CC);
    }
  });
  return emailLists;

}

function processworkflowlogemail(action, original, obj, history, branch) {

  console.log("processworkflowlogemail")
  if (action && action.email) {
    var emails = action.email;

    async.forEachSeries(emails, (t, next) => {

      var emailToLists = [];
      var emailLists = {};
      var receiverLists = [];

      if (t.messagetype == "EMAIL") {
        var fieldnameforEmail = "property.primaryemail";

        const User = require('../models/user.model');
        t.subject = regexrep(t.subject, obj, history, branch);
        if (t.to && t.to.length > 0)
          User.find({ "$or": [{ "_id": { "$in": t.to } }, { "role": { "$in": t.roleid }, branchid: branch._id }] })
            .then(toEmail => {
              if (!toEmail || toEmail.length == 0) return null;

              toEmail.map((user) => {
                receiverLists.push(user._id);
              });
              return regemail(toEmail, fieldnameforEmail, emailToLists);
            })
            .then(emailLists => {
              if (!emailLists) return null;
              if (emailLists.length > 0) {

                var str = regexrep(t.content, obj, history, branch)
                if (str.indexOf("##TINYURL") != -1) {
                  replacetinyurl(str, obj).then((newstr) => {
                    email.sendemail(newstr, emailLists, t, receiverLists, branch);
                  })
                }
                else {
                  email.sendemail(str, emailLists, t, receiverLists, branch);
                }

              }
            })

        var field = t.mappingfield;
        var receiverLists = [];
        var array = false
        emailLists = []
        if (Array.isArray(original[field])) array = true;
        var mappingfieldvalue = ""
        
        if (field == "_id") {
          if (obj["property.send_mail"] && obj["property.send_mail"]=="No"){              
            return;
          }
          mappingfieldvalue = fieldnameforEmail;
          mappingfieldvalue = obj[mappingfieldvalue];
          emailLists.push(mappingfieldvalue);
          receiverLists.push(obj._id);
        }
        else {
          if (array) {
            for (var i = 0; i < original[field].length; i++) {
              mappingfieldvalue = field + "." + i + "." + fieldnameforEmail;
              receiverLists.push(obj[field + "." + i + "._id"]);
              mappingfieldvalue = obj[mappingfieldvalue];
              emailLists.push(mappingfieldvalue);
            }
          }
          else {
            mappingfieldvalue = field + "." + fieldnameforEmail;
            if (obj[field + ".property.send_mail"] && obj[field + ".property.send_mail"]=="No"){              
              return;
            }
            receiverLists.push(obj[field + "._id"]);
            mappingfieldvalue = obj[mappingfieldvalue];
            emailLists.push(mappingfieldvalue);
          }
        }
        // console.log("mappingfieldvalue", mappingfieldvalue)
        console.log("Emaillist", emailLists)
        var str = regexrep(t.content, obj, history, branch);
        if (str.indexOf("##TINYURL") != -1) {
          replacetinyurl(str, obj).then((newstr) => {
            email.sendemail(newstr, emailLists, t, receiverLists, branch);
          })
        }
        else {
          email.sendemail(str, emailLists, t, receiverLists, branch);
        }

      }
      next();
    });

  }

}

function processworkflowlogsms(action, obj, history, branch) {

  if (action && action.sms) {

    var emails = action.sms;
    var receiverLists = [];
    var smsToLists = [];

    async.forEachSeries(emails, (t, next) => {

      if (t.messagetype == "SMS") {

        var fieldnameforMobile = "property.mobile";
        const User = require('../models/user.model');

        if (t.to && t.to.length > 0)
          User.find({ "$or": [{ "_id": { "$in": t.to } }, { "role": { "$in": t.roleid }, branchid: branch._id }] })
            .then(users => {
              if (users.length == 0) return null;
              //console.log("users", users)
              users.map((user) => {
                receiverLists.push(user._id);
              });
              return regsms(users, fieldnameforMobile, smsToLists);
            })
            .then(smsToLists => {
              if (!smsToLists) return null;
              if (smsToLists.length > 0) {

                var str = regexrep(t.content, obj, history, branch);
                if (str.indexOf("##TINYURL") != -1) {
                  replacetinyurl(str, obj).then((newstr) => {
                    smsToLists.forEach(() => {
                      sms.sendsms(newstr, mobile, t, receiverLists, branch._id);
                    })

                  })
                }
                else {
                  smsToLists.forEach((mobile) => {
                    sms.sendsms(str, mobile, t, receiverLists, branch._id);
                  })
                }

              }
            })


        var field = t.mappingfield;

        var mappingfieldvalue = ""

        if (field == "_id") {
          mappingfieldvalue = fieldnameforMobile;
          receiverLists.push(obj._id);
        }
        else {
          mappingfieldvalue = field + "." + fieldnameforMobile;
          receiverLists.push(obj[field + "._id"]);
        }

        mappingfieldvalue = obj[mappingfieldvalue];

        var str = regexrep(t.content, obj, history, branch);
        if (str.indexOf("##TINYURL") != -1) {
          replacetinyurl(str, obj).then((newstr) => {
            sms.sendsms(newstr, mappingfieldvalue, t, receiverLists, branch._id);
          })
        }
        else {
          sms.sendsms(str, mappingfieldvalue, t, receiverLists, branch._id);
        }

      }
      next();

    })

  }

}

function processworkflowlogwhatsapp(action, obj, history, branch) {
  // console.log("processworkflowlogwhatsapp")
  if (action && action.whatsapp) {

    var whatsappalerts = action.whatsapp;
    async.forEachSeries(whatsappalerts, (t, next) => {

      if (t.messagetype == "WHATSAPP") {
        var fieldnameforMobile = "property.whatsapp";
        var field = t.mappingfield;
        var receiverLists = [];

        var mappingfieldvalue = ""

        if (field == "_id") {
          mappingfieldvalue = fieldnameforMobile;
          receiverLists.push(obj._id);
        }
        else {
          mappingfieldvalue = field + "." + fieldnameforMobile;
          receiverLists.push(obj[field + "._id"]);
        }

        var whatsappnumber = obj[mappingfieldvalue];

        var str = regexrep(t.content, obj, history, branch);
        //console.log("whatsappnumber", whatsappnumber)
        if (str.indexOf("##TINYURL") != -1) {
          replacetinyurl(str, obj).then((newstr) => {
            return whatsapp.sendwhatsapp(newstr, whatsappnumber, t, receiverLists, branch._id);
          })
        }
        else {
          whatsapp.sendwhatsapp(str, whatsappnumber, t, receiverLists, branch._id);
        }

      }

      next();

    });

  }

}


function refformfields(formfieldoptions, fieldsarray, last, lastfield, newlast) {

  if (newlast) last = newlast;
  var lastformname = last.substring(last.lastIndexOf(".") + 1)

  formfieldoptions.forEach(function (element) {

    if (element.formname == lastformname) {

      if (element.refform) {
        element["id"] = lastfield + "." + element.fieldname + "._id";
      }
      else {
        element["id"] = lastfield + "." + element.fieldname;
      }
      if (newlast) {
        element["displayid"] = newlast + "." + element.fieldname;
      }
      else {
        element["displayid"] = last + "." + element.fieldname;
      }


      var el = Object.assign({}, element);
      fieldsarray.push(el);

      if (element.refform && element.refform != lastformname) {
        var newlast = last + "." + element.refform;
        refformfields(formfieldoptions, fieldsarray, element.refform, lastfield + "." + element.fieldname, newlast);
      }

    }

  });

}


function getmatches(stages, matches, authkey) {

  var aggregateobj = [];
  ////console.log("matches", matches)

  stages.forEach(function (stage) {

    for (var key in stage) {

      if (key == "$limit") {
        match = matches.find(function (el) {
          return el.searchfield == "limit"
        });
        if (match) {
          stage[key] = match.searchvalue;
        }
      }
      else if (key == "$skip") {
        match = matches.find(function (el) {
          return el.searchfield == "skip"
        });
        if (match) {
          stage[key] = match.searchvalue;
        }
      }
      else if (key == "$lookup") {
        var pipelines = stage[key];
        for (var pipeline in pipelines) {

          if (pipeline == "pipeline") {

            pipelines = pipelines[pipeline];

            pipelines.forEach((stage) => {

              for (var key in stage) {

                if (key == "$match") {

                  var params = stage[key];
                  var match;

                  for (var field in params) {

                    var fieldname = params[field];

                    if (typeof fieldname === 'object') {
                      for (var field1 in fieldname) {
                        if (fieldname) fieldname = fieldname[field1];
                      }
                    }
                    match = matches.find(function (el) {
                      return el.searchfield == fieldname
                    });

                    if (fieldname instanceof Object) {
                      for (var val in fieldname) {

                        if (fieldname[val] && fieldname[val].toString().startsWith("@")) {
                          var obj = {}
                          obj[val] = getformulavalue(fieldname[val], null, authkey.branchid)
                          stage[key][field] = obj
                        }
                      }
                    }

                    if (match) {
                      stage[key][field] = generatereportquery(field, match, authkey);
                    }

                    if (fieldname && fieldname.toString().startsWith("@")) {
                      stage[key][field] = getformulavalue(fieldname, null, authkey.branchid)
                    }
                  }

                }

              }

            })

          }

        }

      }
      else if ((key == "$match" || key == "$project" || key == "$addFields") && matches) {
        var params = stage[key];
        var match;

        for (var field in params) {

          var fieldname = params[field];

          if (typeof fieldname === 'object') {
            for (var field1 in fieldname) {
              if (fieldname) fieldname = fieldname[field1];
            }
          }
          match = matches.find(function (el) {
            return el.searchfield == fieldname
          });
          if (fieldname instanceof Object) {
            for (var val in fieldname) {

              if (fieldname[val] && fieldname[val].toString().startsWith("@")) {
                var obj = {}
                obj[val] = getformulavalue(fieldname[val], null, authkey.branchid)
                stage[key][field] = obj
              }
            }
          }
          if (match) {
            stage[key][field] = generatereportquery(field, match, authkey);
          }

          if (fieldname && fieldname.toString().startsWith("@")) {
            stage[key][field] = getformulavalue(fieldname, null, authkey.branchid)
          }
        }

      }
    }
    // console.log(JSON.stringify(stage))

    aggregateobj.push(stage);
  });

  return aggregateobj;
}

function getformulavalue(formula, params, branch) {

  var now = moment();
  var clientOffset = now.tz(branch.timezone).utcOffset();

  //console.log("options", options)
  switch (formula) {

    case "@ALL":
    case "@All":

      var firstday = new Date(-8640000000000000);
      var lastday = new Date(8640000000000000);

      return { $gte: firstday, $lte: lastday }
      break;

    case "@TODAY":
      var firstday = new Date();
      firstday.setHours(0, 0, 0, 0);
      firstday.setMinutes(firstday.getMinutes() - clientOffset)
      //console.log("db_fieldValue 2", db_fieldValue)
      var lastday = new Date();
      lastday.setHours(0, 0, 0, 0);
      lastday.setMinutes(lastday.getMinutes() - clientOffset)
      // db_fieldValue = new Intl.DateTimeFormat("en-US", options).format(lastday);
      // lastday = new Date(db_fieldValue);

      lastday.setDate(lastday.getDate() + 1)
      lastday.setSeconds(lastday.getSeconds() - 1)
      // console.log("firstday", firstday, lastday)
      //////console.log("##########")
      return { $gte: firstday, $lt: lastday }
      break;

    case "@EXACTYESTERDAY":
      var firstday = new Date();
      firstday.setHours(0, 0, 0, 0);

      firstday.setDate(firstday.getDate() - 1)
      firstday.setHours(23, 59, 0, 0);

      return firstday
      break;
    case "@YESTERDAY":
    case "@Yesterday":
      var firstday = new Date();
      firstday.setDate(firstday.getDate() - 1)
      firstday.setHours(0, 0, 0, 0);
      //////console.log("firstday", firstday)
      //////console.log("----------------")
      var lastday = new Date();
      lastday.setDate(lastday.getDate() - 1)
      firstday.setHours(23, 59, 0, 0);

      ////console.log("lastday", {$gte: firstday, $lte: lastday})
      return { $gte: firstday, $lte: lastday }
      break;

    case "@TOMORROW":
      var firstday = new Date();
      firstday.setHours(0, 0, 0, 0);
      firstday.setDate(firstday.getDate() + 1)
      //////console.log("firstday", firstday)
      //////console.log("----------------")
      var lastday = new Date();
      lastday.setDate(lastday.getDate() + 1)
      lastday.setHours(23, 59, 0, 0);

      //////console.log("lastday", lastday)
      return { $gte: firstday, $lte: lastday }
      break;

    case "@MINDATE":

      var firstday = new Date("1970-01-01");
      firstday.setHours(0, 0, 0, 0);
      return firstday
      break;

    case "@EXACTTODAY":

      var firstday = new Date();
      firstday.setHours(23, 59, 0, 0);
      return firstday
      break;

    case "@WEEK":

      var curr = new Date; // get current date
      /* Note :: following logic not satisfied for different months
       var first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
       // var last = first + 6; // last day is the first day + 6

       // var firstday = new Date(curr.setDate(first)).toUTCString();
       // var lastday = new Date(curr.setDate(last)).toUTCString();
       */
      /*Reference link : https://stackoverflow.com/questions/5210376/how-to-get-first-and-last-day-of-the-week-in-javascript/13190874#13190874
       */
      var firstday = new Date(curr.setDate(curr.getDate() - curr.getDay()));
      var lastday = new Date(curr.setDate(curr.getDate() - curr.getDay() + 6));

      return { $gte: firstday, $lte: lastday }
      break;

    case "@EXACTWEEK":
      var curr = new Date; // get current date
      var first = curr.getDate() - curr.getDay() + 1;
      var firstday = new Date(curr.setDate(first));
      firstday.setHours(0, 0, 0, 0);
      var lastday = new Date();
      lastday.setHours(23, 59, 0, 0);

      return { $gte: firstday, $lte: lastday }
      break;

    case "@THISWEEK":


      var curr = new Date; // get current date
      var first = curr.getDate() + 1;
      var firstday = new Date(curr.setDate(first));
      firstday.setHours(0, 0, 0, 0);


      var curr = new Date; // get current date
      var last = curr.getDate() + 7 - curr.getDay();
      var lastday = new Date(curr.setDate(last));
      lastday.setHours(23, 59, 0, 0);
      return { $gte: firstday, $lte: lastday }
      break;

    case "@STARTOFMONTH":
      //from tomorrow till the end day of this Monthss

      var date = new Date(), y = date.getFullYear(), m = date.getMonth();
      var curr = new Date; // get current date
      var first = 1;
      var firstday = new Date(curr.setDate(first));
      firstday.setHours(0, 0, 0, 0);
      return firstday
      break;

    case "@ENDOFMONTH":
      //from tomorrow till the end day of this Monthss

      var date = new Date(), y = date.getFullYear(), m = date.getMonth();
      var lastday = new Date(y, m + 1, 0, 23, 59, 59)

      return lastday
      break;

    case "@THISMONTH":
      //from tomorrow till the end day of this Monthss

      var date = new Date(), y = date.getFullYear(), m = date.getMonth();
      var curr = new Date; // get current date
      var first = 1;
      var firstday = new Date(curr.setDate(first));
      firstday.setHours(0, 0, 0, 0);

      var lastday = new Date(y, m + 1, 0, 23, 59, 59)
      return { $gte: firstday, $lte: lastday }
      break;

    case "@MONTH":
      var date = new Date(), y = date.getFullYear(), m = date.getMonth();
      var firstday = new Date(y, m, 1);
      var lastday = new Date(y, m + 1, 0);
      return { $gte: firstday, $lte: lastday }
      break;

    case "@YEAR":

      var firstday = new Date(new Date().getFullYear(), 0, 1);
      var lastday = new Date(new Date().getFullYear(), 11, 31);

      return { $gte: firstday, $lte: lastday }
      break;

    //sdsssscff
    case "@LASTWEEK":
    case "@LastWeek":

      var date = new Date(), d = date.getDate(), y = date.getFullYear(), m = date.getMonth();
      var firstday = new Date(y, m, d - 7);

      var lastday = new Date();
      lastday.setHours(23, 59, 0, 0);
      return { $gte: firstday, $lte: lastday }
      break;

    case "@LASTMONTH":
    case "@LastMonth":

      var date = new Date(), d = date.getDate(), y = date.getFullYear(), m = date.getMonth();
      var firstday = new Date(y, m, d - 30);

      var lastday = new Date();
      lastday.setHours(23, 59, 0, 0);
      return { $gte: firstday, $lte: lastday }
      break;

    case "@LAST3MONTH":
    case "@Last3Months":

      var date = new Date(), d = date.getDate(), y = date.getFullYear(), m = date.getMonth();
      var firstday = new Date(y, m - 3, d);

      var lastday = new Date();
      lastday.setHours(23, 59, 0, 0);
      return { $gte: firstday, $lte: lastday }
      break;

    case "@LAST6MONTH":
    case "@Last6Months":

      var date = new Date(), d = date.getDate(), y = date.getFullYear(), m = date.getMonth();
      var firstday = new Date(y, m - 6, d);

      var lastday = new Date();
      lastday.setHours(23, 59, 0, 0);
      return { $gte: firstday, $lte: lastday }
      break;

    case "@LASTYEAR":
    case "@LastYear":

      var date = new Date(), d = date.getDate(), y = date.getFullYear(), m = date.getMonth();
      var firstday = new Date(y - 1, m, d);

      var lastday = new Date();
      lastday.setHours(23, 59, 0, 0);
      return { $gte: firstday, $lte: lastday }
      break;

    case "@OVERDUE":
    case "@OverDue":
      var firstday = new Date(-8640000000000000);
      var lastday = new Date();
      lastday.setHours(0, 0, 0, 0);
      return { $gte: firstday, $lte: lastday }
      break;

    case "@DUEIN7DAY":
    case "@Due7Days":

      var firstday = new Date();
      firstday.setHours(0, 0, 0, 0);
      firstday.setMinutes(firstday.getMinutes() - clientOffset)

      var lastday = new Date();
      lastday.setHours(0, 0, 0, 0);
      lastday.setMinutes(lastday.getMinutes() - clientOffset)

      lastday.setDate(lastday.getDate() + 7)
      lastday.setSeconds(lastday.getSeconds() - 1)

      // var firstday = new Date();
      // firstday.setHours(0, 0, 0, 0);
      // //firstday = firstday.getUTCDate();
      // //////console.log("firstday", firstday);
      // var date = new Date(), d = date.getDate(), y = date.getFullYear(), m = date.getMonth();
      // var lastday = new Date(y, m, d + 7);
      //console.log({ $gte: firstday, $lte: lastday })
      return { $gte: firstday, $lte: lastday }
      break;

    case "@Due15Days":
    case "@DUEIN15DAY":
      var firstday = new Date();
      var date = new Date(), d = date.getDate(), y = date.getFullYear(), m = date.getMonth();
      var lastday = new Date(y, m, d + 15);

      return { $gte: firstday, $lte: lastday }
      break;

    case "@DUEIN30DAY":
    case "@Due30Days":
      var firstday = new Date();
      var date = new Date(), d = date.getDate(), y = date.getFullYear(), m = date.getMonth();
      var lastday = new Date(y, m, d + 30);

      return { $gte: firstday, $lte: lastday }
      break;

    case "@DUEIN60DAY":
    case "@Due60Days":
      var firstday = new Date();
      var date = new Date(), d = date.getDate(), y = date.getFullYear(), m = date.getMonth();
      var lastday = new Date(y, m, d + 60);

      return { $gte: firstday, $lte: lastday }
      break;

    case "@MONTHNUMBER":
      var firstday = new Date();
      var m = firstday.getMonth() + 1;
      return m;
      break;

    case "@DAYNUMBER":
      var firstday = new Date();
      var d = firstday.getDate();
      return d;
      break;

    case "@GTETOMORROW":
      var firstday = new Date();
      firstday.setDate(firstday.getDate());
      return { $gte: firstday };
      break;

    case "@USERID":
      var d = params.authkey._id
      return d;
      break;

  }

}

function adddocfields(fields, docfields) {

  var docfield;
  for (var prop in fields) {
    if (prop == "docnumber") {
      docfield = prop;
    }
  }

  if (docfield) {
    docfields.forEach(element => {
      fields[element] = 1;
    });
  }

}

function generatereportquery(searchfield, element, authkey) {

  var query = {};
  var criteria = element.criteria;
  var datatype = element.datatype;
  var searchvalue = element.searchvalue;
  var utc = element.utc;
  //console.log("element", element)
  //*************************** 
  // Timezone ISSUE
  //***************************/
  //var clienttimezone = "Asia/Kolkata"
  var branch = authkey.branchid; 
  //console.log("###", element) 
  var now = moment();
  //var clientOffset = now.tz(clienttimezone).utcOffset(); // your time zone, not necessarily the server's
  var localOffset = now.tz(branch.timezone).utcOffset();
  //var diffInMinutes = localOffset - clientOffset; 
  // console.log(diffInMinutes, localOffset, clientOffset)
  //console.log("searchvalue", element)
  if (!searchvalue) return;
  if (searchvalue.toString().startsWith("@")) { 
    return getformulavalue(searchvalue, null, branch)
  }

  if (searchvalue.toString().startsWith("#")) {
    return getreplacement(params, element)
  }

  if (searchvalue.toString().startsWith("~")) {
    return getbranchids(authkey, element)
  }
  
  if (datatype.toUpperCase() == "DATE" && criteria.toUpperCase() == "EQ") {

    if (searchvalue["$gte"]) {
      var date = convertolocaltime(branch, searchvalue["$gte"]);
      //date.setMinutes(date.getMinutes() - diffInMinutes)
      searchvalue["$gte"] = date; 
    }
    if (searchvalue["$lte"]) {
      //searchvalue["$lte"] = new Date(searchvalue["$lte"]);
      var date = convertolocaltime(branch, searchvalue["$lte"]);
      //date.setMinutes(date.getMinutes() - diffInMinutes)
      searchvalue["$lte"] = date;
    }
    else if (typeof new Date(searchvalue) == "object") {
      //searchvalue.setMinutes(searchvalue.getMinutes() - diffInMinutes)
      searchvalue["$gte"] = convertolocaltime(branch,searchvalue);
      //searchvalue = new Date(searchvalue)
    }    
    return searchvalue;
  }  
  else if (datatype.toUpperCase() == "DATE" && criteria.toUpperCase() == "FULLDAY") {
    var firstday =  convertolocaltime(branch, searchvalue);
    // firstday.setUTCHours(0, 0, 0, 0);
    // firstday.setUTCDate(firstday.getUTCDate() + 1);
    // firstday.setUTCMinutes(firstday.getUTCMinutes() - localOffset);
    
    //var lastday = new Date(searchvalue);
    var lastday =  convertolocaltime(branch, searchvalue);
    //lastday.setUTCHours(0, 0, 0, 0);
    lastday.setUTCDate(lastday.getDate() + 1)
    //lastday.setUTCMinutes(lastday.getUTCMinutes() - localOffset);

    searchvalue = { $gte: firstday, $lt: lastday };   
  //  console.log("FULLDAY", searchvalue)      
    return searchvalue;
  }
  else if (datatype.toUpperCase() == "TIMESLOT") {
    //console.log("searchvalue", searchvalue)
    var starttime = searchvalue.timeslot.starttime;;
    //console.log("searchvalue.timeslot", searchvalue.timeslot)
    starttime = starttime.split(":");
    starttime = (parseInt(starttime[0]) * 60) + parseInt(starttime[1]);    
    var endtime = searchvalue.timeslot.endtime;
    endtime = endtime.split(":");
    endtime = (parseInt(endtime[0]) * 60) + parseInt(endtime[1]);
    var startdatetime = convertolocaltime(branch, searchvalue.timeslotdate);    
    //console.log("searchvalue.timeslotdate", searchvalue.timeslotdate)
    //appointmentdate.setUTCHours(0, 0, 0, 0);
    //console.log(appointmentdate.getUTCDate(), localOffset);
    //var startdatetime = new Date(appointmentdate)
    //console.log("startdatetime", startdatetime, localOffset)
    // if (localOffset > 0) {
    //   startdatetime.setUTCDate(startdatetime.getUTCDate() + 1);
    // }
    //starttime -= localOffset;
    startdatetime.setUTCMinutes(startdatetime.getUTCMinutes() + starttime)    

    var enddatetime = convertolocaltime(branch, searchvalue.timeslotdate)
    //console.log("enddatetime", enddatetime, localOffset)
    // if (localOffset > 0) {
    //enddatetime.setUTCDate(enddatetime.getUTCDate() + 1);
    // }
    //endtime -= localOffset;
    //console.log("endtime", endtime)
    enddatetime.setUTCMinutes(enddatetime.getUTCMinutes() + endtime)
    searchvalue = [
      {
        "timeslot.startdate": {
          "$gte": startdatetime,
          "$lt": enddatetime
        }
      },
      {
        "timeslot.startdate": {
          "$lte": startdatetime
        },
        "timeslot.enddate": {
          "$gte": enddatetime
        }
      },
      {
        "timeslot.enddate": {
          "$gt": startdatetime,
          "$lte": enddatetime
        }
      }
    ]
   // console.log("searchvalue", searchvalue)
    return  searchvalue;
  }
  else if (datatype.toUpperCase() == "DATE" && criteria.toUpperCase() != "EQ" && utc) {
    var lastday = convertolocaltime(branch, searchvalue);
    // lastday.setUTCHours(0, 0, 0, 0);
    // lastday.setUTCDate(lastday.getUTCDate() + 1)
    // //console.log("lastday", lastday)
    return lastday;
  }
  else if (datatype.toUpperCase() == "DATE" && criteria.toUpperCase() != "EQ") {
    searchvalue = convertolocaltime(branch, searchvalue);    
    return searchvalue;

  }
  if (element.searchvalue == "ALL") {
    return query;
  }

  if (datatype && datatype == "ObjectId") {
    if (criteria == "in") {
      var values = []; 
      if (Array.isArray(element.searchvalue))
        element.searchvalue.forEach(function (item) {
          values.push(mongoose.Types.ObjectId(item))
        });
      else {
        values.push(mongoose.Types.ObjectId(element.searchvalue))
      }
      return { "$in": values };
    }
    else if (criteria == "nin") {
      var values = [];
      if (Array.isArray(element.searchvalue))
        element.searchvalue.forEach(function (item) {
          values.push(mongoose.Types.ObjectId(item))
        });
      else {
        values.push(mongoose.Types.ObjectId(element.searchvalue))
      }
      return { "$nin": values };
    }
    else
      return mongoose.Types.ObjectId(element.searchvalue);
  }
  if (datatype && datatype == "Number") {
    return parseInt(element.searchvalue);
  }

  else {
    return element.searchvalue;
  }

}

function generaterefselect(reffields, select) {
  if (!select || select.length == 0) return [];
  if (select) {
    select.forEach(function (element) {

      var field = element.fieldname.split(".");
      if (field[1] && field[0] != "property" && element.value == 1) {
        var sfield = '-' + field[0];
        if (reffields.indexOf(sfield) > -1) {
          reffields = reffields.replace(sfield, '');
        }
      }

    }, this);
  }

  return reffields;
}

function getreffields(select, vfield) {

  if (!select || select.length == 0) return '-' + field;

  var value = select.find((element) => {
    var field = element.fieldname.split(".");
    if (field[0] == vfield && (element.value == 1 || element.display)) return element;
  });
  if (value) return vfield;
  else return '-' + vfield;
}

function generateselect(select, docfields) {
  if (!select || select.length == 0) return [];
  var fields = {};

  if (select) {

    select.forEach(function (element) {
      if (!element) return;
      var field = element.fieldname.split(".");
      if (field[1] && field[0] != "property" && (element.value == 1 || element.display)) {
        fields[field[0]] = element.value ? element.value : element.display
      }
      else if (field[1] && field[0] == "property" && (element.value == 1 || element.display)) {
        fields[element.fieldname] = element.value
      }
      else if (!field[1] && (element.value == 1 || element.display)) {
        fields[field[0]] = element.value ? element.value : element.display
      }

    }, this);
  }
  if (docfields) adddocfields(fields, docfields);
  return fields;
}
 

function generateselect2(select, docfields) {
  if (!select || select.length == 0) return [];
  var fields = {};

  if (select) {

    select.forEach(function (element) {
      if (!element) return;      
        fields[element.fieldname] = element.value
    }, this);
  }
  if (docfields) adddocfields(fields, docfields);
  //console.log(fields)
  return fields;
}

function generatequery(params) {

  var query = {};
  //   {
  //     "search": [{ "searchfield": "membershipstart" , "searchvalue": { "$gte": "2016-09-20T06:33:47.795Z", "$lte":  "2018-09-20T06:33:47.795Z" } , "criteria": "eq"  },
  //     {"searchfield": "membershipid" , "searchvalue": [ObjectId("59c209e2dfa98711357a1933"), ObjectId("59c20b93dfa98711357a1934"), ObjectId("59c20bcbdfa98711357a1935"), ObjectId("59c20beedfa98711357a1936"), ObjectId("59c20c1fdfa98711357a1937"), ObjectId("59c20c3fdfa98711357a1938"), ObjectId("59c23dc08dd81b1e141391c1"), ObjectId("59c35dff86ee8f715794ccc5"), ObjectId("59ca25c8e2f6c95acff4eeda")] , "criteria": "in"}]
  //  }
  var branch = params.authkey ? params.authkey.branchid : undefined;  
  var search, permissions, formname, formtype;
  var orarray = [];
  var andarray = [];

  if (params !== null && typeof params === 'object' && params.formname) {
    formname = params.formname;
    formtype = params.formtype;
  }
  if (params !== null && typeof params === 'object' && params.search) {
    search = params.search;
  }
  else {
    search = params;
  }
  var isbranchfield = false;
  if (search && Array.isArray(search)) {

    search.forEach(function (element) {
      //console.log(element)
      var criteria = element.criteria;
      var datatype = element.datatype;
      var searchvalue = element.searchvalue;
      if (element.searchfield == "branchid") {
        isbranchfield = true;
      }

      if (searchvalue && searchvalue.toString().startsWith("@")) {
        element.searchvalue = getformulavalue(searchvalue, params, branch)
        query[element.searchfield] = element.searchvalue
      }

      if (typeof element.searchvalue === 'object' && element.datatype !== "Date" && element.searchvalue.constructor === Object) {
        if (element.searchvalue.id) {
          element.searchvalue = element.searchvalue.id;
        }
        else if (element.searchvalue.name) {
          element.searchvalue = element.searchvalue.name;
        }
      }

      if (element.cond && datatype == "Date" && element.cond == "and") {
        var newobj = {}
        var date = convertolocaltime(params, element.searchvalue);
        // date.setUTCHours(0, 0, 0, 0);
        // date.setUTCDate(date.getUTCDate() + 1);
        // date.setUTCMinutes(date.getUTCMinutes() - localOffset);

        if (datatype == "Date" && criteria == "gte") {          
          newobj[element.searchfield] = { $gte: date };
        } else if (datatype == "Date" && criteria == "lte") {
          newobj[element.searchfield] = { $lte: date };
        } else if (datatype == "Date" && criteria == "eq") {
          newobj[element.searchfield] = date;
        }
        //console.log("newobj", newobj)
        andarray.push(newobj)
        return;
      }
      else if (element.cond && element.cond == "and" && datatype != "Date") {
        var newobj = {}

        if (datatype == "Boolean" && criteria == "exists") {
          newobj[element.searchfield] = { $exists: element.searchvalue };
        } else if (datatype == "text" && criteria == "ne") {
          newobj[element.searchfield] = { $ne: element.searchvalue };
        } else if (datatype == "text" && criteria == "nin") {
          newobj[element.searchfield] = { $nin: element.searchvalue };
        } else if (datatype == "text") {
          newobj[element.searchfield] = element.searchvalue;
        }
        andarray.push(newobj)
        return;
      }

      if (element.cond && element.cond == "or") {

        var newobj = {}
        if ((element.datatype == "ObjectID" || element.datatype == "ObjectId" || element.datatype == "form") && element.criteria == "eq") {
          newobj[element.searchfield] = mongoose.Types.ObjectId(element.searchvalue);
        }
        else if ((element.datatype == "ObjectID" || element.datatype == "ObjectId" || element.datatype == "form") && element.criteria == "ne") {
          newobj[element.searchfield] = { $ne: mongoose.Types.ObjectId(element.searchvalue) };
        }
        else if ((element.datatype == "ObjectID" || element.datatype == "ObjectId" || element.datatype == "form") && element.criteria == "in") {
          if (Array.isArray(element.searchvalue)) {
            var newarr = [];
            element.searchvalue.forEach(function (el) {
              newarr.push(mongoose.Types.ObjectId(el))
            })
            newobj[element.searchfield] = { $in: newarr };
          }
          else {
            newobj[element.searchfield] = { $in: [mongoose.Types.ObjectId(element.searchvalue)] };
          }
        }
        else if (element.datatype == "boolean" && element.criteria == "exists") {
          newobj[element.searchfield] = { $exists: element.searchvalue };
        }
        else {
          newobj[element.searchfield] = element.searchvalue;
        }

        orarray.push(newobj)
        return;
      }

      if (datatype == "Date" && criteria == "eq") {
        for (const prop in element.searchvalue) {
          if (prop == "$gte" || prop == "$gt" || prop == "$lte" || prop == "$lt") {
            var date = convertolocaltime(params, element.searchvalue[prop]);
            element.searchvalue[prop] = date;
          }
        }
        query[element.searchfield] = element.searchvalue;
        return;
      }
      
      if (datatype == "Date" && element.criteria == "fullday") {
        
        var startday = convertolocaltime(params, element.searchvalue); 
        // startday.setUTCHours(0, 0, 0, 0);
        // startday.setUTCDate(startday.getUTCDate() + 1);
        // startday.setUTCMinutes(startday.getUTCMinutes() - localOffset);
        var newobj = {}
        newobj[element.searchfield] = { $gte: startday };
        andarray.push(newobj);

        var newobj = {}
        var endday = convertolocaltime(params, startday);
        //endday.setUTCHours(0, 0, 0, 0);
        endday.setUTCDate(endday.getDate() + 1)
        //endday.setUTCMinutes(endday.getUTCMinutes() - localOffset);
        newobj[element.searchfield] = { $lt: endday };
        andarray.push(newobj);
        //console.log(newobj)
        return;
      }

      if (datatype == "Date" && criteria != "eq") {
        if (criteria == "gte") {
          var startday = convertolocaltime(params, element.searchvalue);
          //var startday = new Date(Intl.DateTimeFormat(locale, options).format(date))
          query[element.searchfield] = { $gte: startday };
        }
        if (criteria == "lte") {
          var endday = convertolocaltime(params, element.searchvalue);
          //var endday = new Date(Intl.DateTimeFormat(locale, options).format(date))
          query[element.searchfield] = { $lte: endday };
        }
        if (criteria == "ne") {
          query[element.searchfield] = { "$ne": null }
        }
        return;
      }


      if (element.searchvalue == "ALL") {
        return;
      }
      if (datatype && (datatype.toLowerCase() == "objectid" || element.datatype == "form")) {
        if (Array.isArray(searchvalue)) {
          var searchvalue1 = [];
          searchvalue.forEach(function (e) {
            searchvalue1.push(mongoose.Types.ObjectId(e))
          })
          element.searchvalue = searchvalue1;
        }
        else {
          element.searchvalue = mongoose.Types.ObjectId(element.searchvalue);
        }
        // return;
      }

      if (criteria == "eq") {
        query[element.searchfield] = element.searchvalue;
      }
      else if (criteria == "lk") {
        query[element.searchfield] = { $regex: new RegExp(".*" + element.searchvalue.toLowerCase() + ".*", "i") };
      }
      else if (criteria == "gt") {
        //{ age: { $gt: 21 }}
        query[element.searchfield] = { $gt: element.searchvalue };
      }
      else if (criteria == "gte") {
        //{ age: { $gte: 21 }}
        query[element.searchfield] = { $gte: element.searchvalue };
      }
      else if (criteria == "lt") {
        //{ age: { $lt: 21 }}
        query[element.searchfield] = { $lt: element.searchvalue };
      }
      else if (criteria == "lte") {
        //{ age: { $lte: 21 }}
        query[element.searchfield] = { $lte: element.searchvalue };
      }
      else if (criteria == "ne") {
        //{ age: { $lte: 21 }}
        query[element.searchfield] = { $ne: element.searchvalue };
      }
      else if (criteria == "in") {
        //{ age: { $lte: 21 }}
        query[element.searchfield] = { $in: element.searchvalue };
      }
      else if (criteria == "exists") {
        //{ age: { $lte: 21 }}
        query[element.searchfield] = { $exists: element.searchvalue };
      }
      else if (criteria == "size") {
        //{ age: { $lte: 21 }}
        query[element.searchfield] = { $size: element.searchvalue };
      }
      else if (criteria == "nin") {
        //{ age: { $lte: 21 }}
        query[element.searchfield] = { $nin: element.searchvalue };
      }
    }, this);
  }

  var viewallpermission = false;

  if (params.authkey && formname && !formtype) {
    // console.log("formpermission", formname)
    permissions = params.authkey.role.permissions;
    var formper = permissions.filter(per => per.formname == formname);
    if (formper && formper.length > 0 && formper[0].recordpermission && formper[0].recordpermission.length > 0) {
      formper = formper[0].recordpermission;
      var viewper = formper.filter(per => per.type == "view");
      if (viewper.length > 0 && viewper[0].datapermission !== "All") {
        if (viewper[0].datapermission === "My" && (formname == "user" || formname == "member")) {
          query["_id"] = mongoose.Types.ObjectId(params.authkey._id);
        }
        else if (viewper[0].datapermission === "My") {
          query["addedby"] = params.authkey._id;
        }

        if (formname == "branchid" && viewper[0].datapermission === "My Branch" && params.authkey.branchid._id) {
          if (!query["_id"])
            query["_id"] = mongoose.Types.ObjectId(params.authkey.branchid._id);
        }
        else if (viewper[0].datapermission === "My Branch" && params.authkey.branchid._id) {
          //console.log("query 1", query)
          if (query["$or"]) {
            query["$or"].forEach(element => {
              if (!element.hasOwnProperty('branchid')) {
                query["$or"].push({ branchid: params.authkey ? mongoose.Types.ObjectId(params.authkey.branchid._id) : null })
                query["$or"].push({ branchid: { "$exists": false } })
              }
            });

          }
        }
      }
      else {
        viewallpermission = true;
      }
    }
    else if (formper && formper.length == 0 && formname != "form" && formname != "langresource" && formname != "dashboard"
      && formname != "organization" && formname != "menu" && formname != "menupermission" && formname != "inventory"
      && formname != "formfield" && formname != "formfieldoption" && formname != "formlist" && formname != "paymentterm"
      && formname != "quickform" && formname != "history" && formname != "lookup" && formname != "formdata" && formname != "document"
      && formname != "folder" && formname != "activity" && formname != "disposition" && formname != "template") {
      if (formname = "user" || formname == "member") {
        //query["_id"] = mongoose.Types.ObjectId(params.authkey._id);
      }
      else {
        query["_id"] = null;
      }
      return { _id: null };
    }
  }
  // if (orarray && orarray.length != 0) {
  //   if (query["$or"]) {
  //     query["branchid"] = mongoose.Types.ObjectId(params.authkey.branchid._id)
  //   }
  //   query["$or"] = orarray;
  // }
  if (andarray && andarray.length != 0) {
    query["$and"] = andarray;
  }
  if (!query.hasOwnProperty('status')) {
    query['status'] = { "$ne": "deleted" }
  }

  if (DATABASETYPE == "branchwise" && !query.hasOwnProperty('branchid') && !viewallpermission) {

    if (query["$or"] || (orarray && orarray.length > 0)) {
      var or1 = query["$or"] ? query["$or"] : orarray;
      var or2 = [{
        branchid: params.authkey ? mongoose.Types.ObjectId(params.authkey.branchid._id) : null,
      },
      {
        branchid: { "$exists": false }
      }]

      query["$and"] = [
        { "$or": or1 },
        { "$or": or2 }
      ];
      delete query["$or"];
    }
    else if (orarray && orarray.length > 0) {
      // orarray.push({
      //   branchid: params.authkey ? mongoose.Types.ObjectId(params.authkey.branchid._id) : null,
      // },
      // {
      //   branchid: { "$exists": false }
      // })
      // TEMP FIX FOR MEMBROZ
      query["branchid"] = params.authkey ? mongoose.Types.ObjectId(params.authkey.branchid._id) : null;

    }
    else {

      query["$or"] = [{
        branchid: params.authkey ? mongoose.Types.ObjectId(params.authkey.branchid._id) : null,
      },
      {
        branchid: { "$exists": false }
      }]

    }

  }
  else {

    if (orarray && orarray.length > 0)
      query["$or"] = orarray;

  }
  return query;
}

function updatesaledetail(bill, body) {

  var taxdetail = {};
  var taxtotal = 0;
  var discount = 0;
  var amount = 0;
  var totalamount = 0;
  var paidamount = bill.paidamount ? bill.paidamount : 0;
  var membershipdiscount = body.membershipdiscount ? body.membershipdiscount : [];

  if (body.items) {
    var items = [];

    body.items.forEach(item => {
      if (!item.sale) item.sale = {};
      item.sale.rate = item.item.sale && item.item.sale.rate ? item.item.sale.rate : item.sale.rate ? item.sale.rate : 0;
      item.sale.taxes = item.item.sale && item.item.sale.taxes ? item.item.sale.taxes : item.sale.taxes ? item.sale.taxes : [];
      item.sale.discount = item.item.sale && item.item.sale.discount ? item.item.sale.discount : item.sale.discount ? item.sale.discount : 0;
      item.sale.discounttype = item.item.sale && item.item.sale.discounttype ? item.item.sale.discounttype : item.sale.discounttype ? item.sale.discounttype : '';
      item.rate = item.sale.rate;
      item.cost = item.sale.rate * item.quantity;
      var taxes = item.sale.taxes;
      let itemdiscount = 0;
      if (item.sale.discounttype && item.sale.discounttype == "Percentage") {
        itemdiscount += item.sale.discount * item.sale.rate * item.quantity / 100;
      }
      else {
        itemdiscount += item.sale.discount * item.quantity;
      }
      var membershipitem = membershipdiscount.find((membershipitem) => {
        return membershipitem.type == "billitem" &&
          item.itemid.toString() == membershipitem.itemid.toString();
      })

      if (membershipitem) itemdiscount += membershipitem.discount;
      itemdiscount += item.coupondiscount ? (item.coupondiscount * item.quantity) : 0; 
      item.discount = itemdiscount;
      item.totalcost = item.sale.rate * item.quantity;
      totalamount += item.totalcost;
      discount += itemdiscount;

      amount += item.sale.rate * item.quantity;
      var taxamount = 0
      if (taxes && taxes.length > 0) {
        taxes.forEach(tax => {
          tax.amount = tax.amount ? tax.amount : 0;
          taxamount += round(tax.amount * (item.totalcost - itemdiscount) / 100, 2);
          if (taxdetail.hasOwnProperty(tax.taxname)) {
            taxdetail[tax.taxname] += round(tax.amount * (item.totalcost - itemdiscount) / 100, 2);
          }
          else {
            taxdetail[tax.taxname] = round(tax.amount * (item.totalcost - itemdiscount) / 100, 2);
          }
        })
      }
      taxtotal += taxamount;
      totalamount += taxamount;
      item.totalcost += taxamount - itemdiscount;
      item.taxamount = taxamount;
      items.push(item);
    })
    bill.items = items;
  }

  if (body.services) {
    var services = [];
    body.services.forEach(item => {
      
      var taxes = item.taxes;
      item.rate = item.cost;
      item.cost = item.cost;
      totalamount += item.totalcost;
      item.quantity = item.quantity ? item.quantity : 1;
      amount += item.cost * item.quantity;
      let itemdiscount = item.discount * item.quantity;
      var membershipitem = membershipdiscount.find((membershipitem) => {
        var serviceid = membershipitem.serviceid && membershipitem.serviceid._id ? membershipitem.serviceid._id : membershipitem.serviceid;
        return membershipitem.type == "service" &&
          item.refid.toString() == serviceid.toString();
      })

      if (membershipitem) itemdiscount += membershipitem.discount;
      if (item.coupondiscount) itemdiscount += item.coupondiscount;
      item.discount = itemdiscount;
      item.totalcost = item.cost * item.quantity - itemdiscount;
      discount += itemdiscount;
      var taxamount = 0;
      if (taxes && taxes.length > 0)
        taxes.forEach(tax => {
          tax.amount = tax.amount ? tax.amount : 0;
          taxamount += round(tax.amount * (item.quantity * item.cost - itemdiscount) / 100, 2)
          if (taxdetail.hasOwnProperty(tax.taxname)) {
            taxdetail[tax.taxname] += round(tax.amount * (item.quantity * item.cost - itemdiscount) / 100, 2)
          }
          else {
            taxdetail[tax.taxname] = round(tax.amount * (item.quantity * item.cost - itemdiscount) / 100, 2);
          }

      }) 
      taxtotal += taxamount

      totalamount += taxamount;
      //console.log("totalamount # 2", totalamount, item.discount)
      item.totalcost += taxamount;
      item.taxamount = taxamount;
      services.push(item);
      

    })
    bill.services = services;
  }

  if (body.assets) {
    var assets = [];
    body.assets.forEach(item => {
      // console.log("updatesaledetail", item)
      var taxes = item.taxes;
      item.quantity = item.quantity ? item.quantity : 1;
      item.discount = item.discount ? item.discount : 0;
      item.rate = item.cost;
      item.cost = item.cost;
      amount += item.cost * item.quantity;
      let itemdiscount = item.discount * item.quantity;

      var membershipitem = membershipdiscount.find((membershipitem) => {
        var serviceid = membershipitem.serviceid && membershipitem.serviceid._id ? membershipitem.serviceid._id : membershipitem.serviceid;
        return membershipitem.type == "asset" &&
          item.refid.toString() == serviceid.toString();
      })
      if (membershipitem) itemdiscount += membershipitem.discount;
      if (item.coupondiscount) itemdiscount += item.coupondiscount;
      item.discount = itemdiscount;
      item.totalcost = item.cost * item.quantity - itemdiscount;
      discount += itemdiscount;

      var taxamount = 0
      if (taxes && taxes.length > 0) {
        taxes.forEach(tax => {
          taxamount += round(tax.amount * (item.quantity * item.cost - itemdiscount) / 100, 2)
          if (taxdetail.hasOwnProperty(tax.taxname)) {
            taxdetail[tax.taxname] += round(tax.amount * (item.quantity * item.cost - itemdiscount) / 100, 2);
          }
          else {
            taxdetail[tax.taxname] = round(tax.amount * (item.quantity * item.cost - itemdiscount) / 100, 2);
          }
        })
      }


      taxtotal += taxamount
      totalamount += taxamount;

      //console.log("totalamount # 3", totalamount, item.discount)

      item.totalcost += taxamount;
      item.taxamount = taxamount;
      assets.push(item);
    })
    bill.assets = assets;
  }


  if (body.packages) {
    var packages = [];
    body.packages.forEach(item => {
      // console.log("updatesaledetail", item)
      var taxes = item.taxes;
      item.quantity = item.quantity ? item.quantity : 1;
      item.discount = item.discount ? item.discount : 0;
      item.rate = item.rate;
      item.cost = item.rate;
      amount += item.cost * item.quantity;
      var itemdiscount = item.discount * item.quantity;

      var membershipitem = membershipdiscount.find((membershipitem) => {
        var serviceid = membershipitem.serviceid && membershipitem.serviceid._id ? membershipitem.serviceid._id : membershipitem.serviceid;
        return membershipitem.type == "package" &&
          item.refid.toString() == serviceid.toString();
      })
      if (membershipitem) itemdiscount += membershipitem.discount;
      item.discount = itemdiscount;
      item.totalcost = item.cost * item.quantity - itemdiscount;
      discount += itemdiscount;

      var taxamount = 0
      if (taxes && taxes.length > 0) {
        taxes.forEach(tax => {
          taxamount += round(tax.amount * (item.quantity * item.cost - itemdiscount) / 100, 2)
          if (taxdetail.hasOwnProperty(tax.taxname)) {
            taxdetail[tax.taxname] += round(tax.amount * (item.quantity * item.cost - itemdiscount) / 100, 2);
          }
          else {
            taxdetail[tax.taxname] = round(tax.amount * (item.quantity * item.cost - itemdiscount) / 100, 2);
          }
        })
      }


      taxtotal += taxamount
      totalamount += taxamount;

      //console.log("totalamount # 3", totalamount, item.discount)

      item.totalcost += taxamount;
      item.taxamount = taxamount;
      packages.push(item);
    })
    bill.packages = packages;
  }

  bill.amount = amount;
  bill.taxamount = taxtotal ? taxtotal : 0;
  bill.discount = discount;

  bill.totalamount = amount + taxtotal - discount;
  bill.taxdetail = taxdetail;

  bill.balance = bill.totalamount - paidamount;
  // console.log(amount, taxtotal, discount)
  // console.log(bill)

}


function updatepurchasedetail(bill, body) {
  
  var taxdetail = {};
  var taxtotal = 0;
  var totalamount = 0;
  if (body.items) {
    var items = [];
    body.items.forEach(item => {
      var taxes = item.item.purchase.taxes;
      item.cost = item.item.purchase && item.item.purchase.rate ? item.item.purchase.rate : item.purchase.rate ? item.purchase.rate : 0;;
      
      item.totalcost = item.cost * item.quantity;
      totalamount += item.totalcost;

      var taxamount = 0
      if (taxes && taxes.length > 0)
        taxes.forEach(tax => {
          taxamount += tax.amount * item.totalcost / 100;
          if (taxdetail.hasOwnProperty(tax.taxname)) {
            taxdetail[tax.taxname] += taxamount;
          }
          else {
            taxdetail[tax.taxname] = taxamount;
          }
        })


      taxtotal += taxamount;
      item.taxes = taxes;
      item.totalcost += taxamount;
      item.taxamount = taxamount;
      items.push(item);
    })
    bill.items = items;
  }
  bill.amount = totalamount;
  bill.totalamount = totalamount + taxtotal;
  bill.taxdetail = taxdetail;

}

function workflowcriteria(workflow) {

  var workflow = workflow;
  var condition = {}
  var match = {}

  var criteria = [];

  if (workflow.criteriaRules == 'filterRecords' && workflow.criteria.length > 0) {

    criteria = workflow.criteria;

    for (var j = 0; j < criteria.length; j++) {
      var cond = criteria[j];

      if (cond["fieldvalue"] && cond["fieldname"] && cond["operator"]) {

        var operator = cond["operator"];
        var fieldname = cond["fieldname"];
        var fieldvalue = cond["fieldvalue"];

        if (fieldname) {
          switch (operator) {
            case 'exists':
              condition[fieldname] = { "$exists": fieldvalue }
              break;
            case 'is':
            case '=':
              condition[fieldname] = fieldvalue;
              break;
            case 'isnt':
            case '!=':
              condition[fieldname] = { "$ne": fieldvalue };
              break;
            default:
              condition[fieldname] = fieldvalue;
          }
        }
      }
      match = { "$match": condition }
    }
  }

  return match;
}

function createactivity(obj, useroleids, formid, req) {

  var duedate = new Date();
  duedate.setDate(duedate.getDate() + parseInt(useroleids.activitytemplateid.duedate.dueday))
  var schemaname = titleCase(formid.formname)
  var activity = {
    type: "task",
    templateid: useroleids.activitytemplateid._id,
    priority: useroleids.activitytemplateid.priority,
    duedate: duedate,
    customerid: obj.userid,
    onModel: "User",
    refid: obj._id,
    onRefModel: schemaname,
    assingeeuser: useroleids.userid,
    assingeerole: useroleids.roleid
  }
  activity = new Activity(activity).save(req)

}

function titleCase(str) {
  return str.toLowerCase().replace(/\b(\w)/g, s => s.toUpperCase());
}

function round(number, decimalPlaces) {
  const factorOfTen = Math.pow(10, decimalPlaces)
  return Math.round(number * factorOfTen) / factorOfTen
}

function getfilterbyref(searchrefs, data) {

  var result = [];
  searchrefs.forEach(field => {
    var sfield = field.searchfield.split(".")
    result = data.filter(element => {
      //console.log(element[sfield[0]][sfield[1]], field.searchvalue)
      return element[sfield[0]][sfield[1]] == field.searchvalue;
    })
  });
  return result;

}

function connecttocall(from, to) {

  var key = "d9f7c75179f974e6c0a400425370c18c91f1f9f57cc9110b"
  var sid = "vervitude1"
  var token = "ba052c46579e6104c3164ab482156504a611c5a7f93aaf90"
  from = from ? from : "918758363923"
  to = to ? to : "918758363925"

  const formUrlEncoded = x => Object.keys(x).reduce((p, c) => p + `&${c}=${encodeURIComponent(x[c])}`, '')

  const axios = require('axios')
  var url = "https://" + key + ":" + token + "@api.exotel.in/v1/Accounts/" + sid + "/Calls/connect"
  axios.post(url,
    formUrlEncoded({
      "From": from,
      "To": to,
      "CallerId": '02248932763',
      "CallerType": 'promo',
    }),
    {
      withCredentials: true,
      headers: {
        "Accept": "application/x-www-form-urlencoded",
        "Content-Type": "application/x-www-form-urlencoded"
      }
    },
  )
    .then((res) => {
      console.log(`statusCode: ${res.statusCode}`)
      console.log(res)
    })
    .catch((error) => {
      console.error(error)
    })
}

function convertolocaltime(body, date) {
  var branch = (body.authkey && body.authkey.branchid) ? body.authkey.branchid : body;
  date = new Date(date);
  var now = moment();
  var localOffset = branch ? now.tz(branch.timezone).utcOffset() : 0;
  date.setUTCHours(0, 0, 0, 0);
  if (localOffset >= 0) {
    date.setUTCDate(date.getUTCDate() + 1);
  }  
  date.setUTCMinutes(date.getUTCMinutes() - localOffset);
  //console.log(date)
  return date;
}