// const bcrypt = require('bcrypt');
import async from "async";
const Joi = require('joi');
const Reportscheduler = require('../models/reportscheduler.model');
const Reportschedulerview = require('../views/reportscheduler.view');
var ObjectID = require('mongodb').ObjectID;
var url = process.env.MONGO_HOST;
var MongoClient = require('mongodb').MongoClient;
const common = require('../helpers/common');
import email from '../helpers/email';
const moment = require('moment');

const reportschedulerSchema = Joi.object({
  title: Joi.string().required(),
  schemaname: Joi.string().required(),
  schedule: Joi.string().required(),
  communicationid: Joi.string().hex().required(),
  property: Joi.object()
})


module.exports = {
  insert,
  update,
  remove,
  filter,
  generatereport,
  findcount,
  findbyId,
  exportdata
}

async function findbyId(Id) {
  return await Reportscheduler.findById(Id);
}

async function insert(req) {
  var reportscheduler = {
    title: req.body.title,
    schemaname: req.body.schemaname,
    schedule: req.body.schedule,
    communicationid: req.body.communicationid,
    property: req.body.property
  }
  reportscheduler = await Joi.validate(reportscheduler, reportschedulerSchema, { abortEarly: false });
  return await new Reportscheduler(reportscheduler).save(req);
}

async function update(Id, req) {
  var reportscheduler = await Reportscheduler.findById(Id);
  reportscheduler._original = reportscheduler.toObject();
  reportscheduler.title = req.body.title,
  reportscheduler.schemaname = req.body.schemaname,
  reportscheduler.schedule = req.body.schedule,
  reportscheduler.communicationid = req.body.communicationid,
  reportscheduler.property = req.body.property
  return await reportscheduler.save(req);
}

async function remove(Id, req) {
  var reportscheduler = await Reportscheduler.findById(Id);
  reportscheduler.status = "deleted"
  return await reportscheduler.save(req);
}

async function filter(params) {
  return await Reportscheduler.getbyfilter(params)
}

async function findcount(req) {
  return await Reportscheduler.findcount(req)
}

async function exportdata(params) {
  return await Reportscheduler.exportdata(params)
}

async function generatereport(req) {

  Reportschedulerview.find({ status: 'active' })
    .then(reportschedules => {

      MongoClient.connect(url, function (err, client) {

        var db = client.db();

        async.forEachSeries(reportschedules, (reportschedule, next) => {

          var timezone = reportschedule.branchid.timezone;
          
          var locale = reportschedule.branchid.locale ? reportschedule.branchid.locale : "en-US";
          var date = new Date();
          var options = {
            hour: 'numeric',
            hour12: false,
            timeZone: timezone ? timezone : "Asia/Kolkata"
          };
          var now = moment();
          var clientOffset = now.tz(timezone).utcOffset();
          //console.log("reportschedule.property", reportschedule.property)
          var hour = Intl.DateTimeFormat(locale, options).format(date)
          //console.log("hour 1", hour)
          if (hour == 22 && reportschedule.property) {
            //console.log("hour 2", hour)
            var action = reportschedule.action;
            var userids = reportschedule.property["userid"];
            var branchid = reportschedule.branchid._id;
            var aggregate = reportschedule.aggregate
            var schemaname = reportschedule.schemaname;
            var matches = []
            //var startDate = new Date();
            var startDate = new Date();
            startDate.setUTCHours(0, 0, 0, 0);      
            startDate.setUTCMinutes(-clientOffset)
            //console.log("startDate", startDate)
            // var endDate = new Date();
            // endDate.setDate(endDate.getDate() + 1);

            var endDate = new Date();
            endDate.setUTCHours(0, 0, 0, 0);      
            endDate.setUTCMinutes(-clientOffset)
            endDate.setDate(endDate.getDate() + 1)
            endDate.setSeconds(endDate.getSeconds() - 1)

            var fromytd = new Date();
            fromytd.setDate(fromytd.getDate() - 365);
            var toytd = new Date();
            toytd.setDate(toytd.getDate() + 1);

            matches.push({ "searchfield": "fromytd", "searchvalue": fromytd, "criteria": "eq", "datatype": "Date" })
            matches.push({ "searchfield": "toytd", "searchvalue": toytd, "criteria": "eq", "datatype": "Date" })
            matches.push({ "searchfield": "startdate", "searchvalue": startDate, "criteria": "eq", "datatype": "Date" })
            matches.push({ "searchfield": "enddate", "searchvalue": endDate, "criteria": "eq", "datatype": "Date" })
            matches.push({ "searchfield": "branchid", "searchvalue": branchid, "criteria": "eq", "datatype": "ObjectId" })
            var authkey = {
              branchid: reportschedule.branchid
            }
            //console.log(authkey)
            aggregate = common.getmatches(aggregate, matches, authkey);

            db.collection(schemaname).aggregate(aggregate) 
              .toArray(function (err, result) {
                // console.log("schemaname", schemaname)
                //console.log(JSON.stringify(aggregate))
                var communications = action.email;
                if (result && result.length > 0) {
                  result = result[0];
                  var emailLists = []
                  var receiverLists = [];
                  var branch = reportschedule.branchid; //result["branchid"];
                  userids.forEach(user => {
                    emailLists.push(user.property["primaryemail"])
                    var receiver = { _id: user._id, onModel: "User" }
                    receiverLists.push(receiver)
                  })
                  communications.forEach((communication) => {
                    var str = regexrep(communication.content, result, branch)
                   // console.log("str", emailLists)
                    email.sendemail(str, emailLists, communication, receiverLists, branch);
                  })

                  next();
                }
                else next();

              });

          }
          else next();

        }, function () {
          if (client) client.close();
        })

      })

    });

}


function regexrep(str, element, branch) {

  var shortcode_regex = /\[{(\w+)+\@?\.?(\w+)\@?\.?(\w+)\}]/mg; // Changes in REGEX
  str.replace(shortcode_regex, function (match, code) {

    var replace_str = match.replace('[{', '');
    replace_str = replace_str.replace('}]', '');
    var original = replace_str;
    var datatype;

    if (replace_str.startsWith("DATE@")) {
      datatype = "Date";
      replace_str = replace_str.substring("DATE@".length)
    } else if (replace_str.startsWith("CURRENCY@")) {
      datatype = "Currency"
      replace_str = replace_str.substring("CURRENCY@".length)
    }

    var db_fieldValue;
    var fieldnameSplit = replace_str.split('.');
    if (fieldnameSplit[3]) {
      if (element[fieldnameSplit[0]]) {
        var obj = element[fieldnameSplit[0]][fieldnameSplit[1]]
        db_fieldValue = obj[fieldnameSplit[2]][fieldnameSplit[3]];
      } else {
        db_fieldValue = '';
      }

    } else if (fieldnameSplit[2]) {
      if (element[fieldnameSplit[0]]) {
        var obj = element[fieldnameSplit[0]][fieldnameSplit[1]]
        db_fieldValue = obj[fieldnameSplit[2]];
      } else {
        db_fieldValue = '';
      }

    } else if (fieldnameSplit[1]) {
      if (element[fieldnameSplit[0]]) {
        db_fieldValue = element[fieldnameSplit[0]][fieldnameSplit[1]];
      } else {
        db_fieldValue = '';
      }

    } else if (fieldnameSplit[0]) {
      if (element[fieldnameSplit[0]] || element[fieldnameSplit[0]] == 0) {
        db_fieldValue = element[fieldnameSplit[0]];
      } else {
        db_fieldValue = '';
      }

    }

    var currency = branch.currency ? branch.currency : "USD";
    var locale = branch.locale ? branch.locale : "en-US";

    if (datatype && datatype.toLowerCase() == "currency") {
      db_fieldValue = new Intl.NumberFormat(locale, { style: 'currency', currency: currency }).format(db_fieldValue);
    }
    else if (db_fieldValue && datatype && datatype.toLowerCase() == "date") {
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
    else if (db_fieldValue && datatype && datatype.toLowerCase() == "datetime") {
      var options = {
        year: 'numeric', month: 'numeric', day: 'numeric',
        hour: 'numeric', minute: 'numeric', second: 'numeric',
        timeZone: branch.timezone
      };
      db_fieldValue = new Intl.DateTimeFormat(locale, options).format(db_fieldValue)
    }
    else if (db_fieldValue && datatype && datatype.toLowerCase() == "time") {
      var db_fieldValue = new Date(db_fieldValue);
      var options = {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        timeZone: branch.timezone
      };
      db_fieldValue = new Intl.DateTimeFormat(locale, options).format(db_fieldValue)
    }
    str = str.replace("$[{" + original + "}]", db_fieldValue ? db_fieldValue : '-');

  });


  return str;

}

