"use strict";
var mongoose = require('mongoose')
  , hm = require('./history-model');
const async = require('async')
var url = process.env.MONGO_HOST;
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

module.exports = function historyPlugin(schema, options) {

  const customCollectionName  = options && options.customCollectionName;
  const schemaname  = options && options.metadata[0].value;
  const diffOnly  = options && options.diffOnly;
  const metadata = options && options.metadata;
  var branch ={}
  // Clear all history collection from Schema
  schema.statics.historyModel = function() {
    return hm.HistoryModel(hm.historyCollectionName(this.collection.name, customCollectionName), options);
  };

  // Clear all history documents from history collection
  schema.statics.clearHistory = function(callback) {
    var History = hm.HistoryModel(hm.historyCollectionName(this.collection.name, customCollectionName), options);
    History.remove({}, function(err) {
      callback(err);
    });
  };

  schema.pre('save', function (next, req) {
    this.req = req;
    this.newobj = this.isNew
    if (!req.headers && req.body.authkey) {
      req.headers = {
        authkey: req.body.authkey
      }
    }    
    //if (!req.headers) next();
    if (req.headers && req.headers.authkey) {
      if (this.isNew)
        this.addedby = req.headers.authkey;
      this.updatedby = req.headers.authkey;
      if (!this.branchid)
        this.branchid = req.body.authkey ? req.body.authkey.branchid._id : null;
      if (req.body.authkey)
        branch = req.body.authkey.branchid;
    }

    var original = this.toObject();
    this.original = original;
    next();
  });

  // Create an copy when insert or update
  schema.post('save', function(doc, next) {
    //console.log(doc)
    var req = this.req;
    let historyDoc = {};
    var diff = {};    
    historyDoc.authkey = req.headers ? req.headers.authkey : null;
    var original = this._original ? this._original : this.original;
    var obj = this.toObject();
    // if (options.metadata[0].value=="activities"){
    //   obj = obj.customerid;
    // }
    let operation = this.newobj ? 'i' : 'u';
    if(diffOnly && !this.newobj) {
      delete this._original;
      var d = this.original;
      // console.log(original)
      // console.log(d)
      diff['_id'] = d['_id'];
      for (var k in d) {
        // console.log("String(d[k])", String(d[k]));
        // console.log("String(d[k])", String(original[k]));
        if (String(d[k]) != String(original[k])) {
          diff[k] = d[k];
        }
        //console.log("diff", diff[k])
        if (typeof d[k] == "object" && (k == "property")) {
          diff[k] = {}

          if (!original["property"]) original["property"] = {}
          for (var k1 in d[k]) {

            if (String(d[k][k1]) != String(original[k][k1]) && Array.isArray(d[k][k1])) {

              var added = []
              var deducted = []
              if (original[k][k1]) {
                added = d[k][k1].filter(x => original[k][k1].indexOf(x) === -1);
                deducted = original[k][k1].filter(x => d[k][k1].indexOf(x) === -1);
              }
              else {
                added = d[k][k1];
              }
              // console.log("added", added)
              // console.log("deducted", deducted)
              diff[k][k1] = added;
              // deducted.forEach((deduct) => {
              //   diff[k][k1].push("-" + deduct);
              // })
            }
            if (String(d[k][k1]) != String(original[k][k1]) && !Array.isArray(d[k][k1])) {
              diff[k][k1] = d[k][k1];
            }
          }

        }
        else if (typeof d[k] == "object" && (k == "formid")) {
          diff[k] = d[k]._id;
        }
        else if (typeof d[k] == "object" && (k == "dispositionid")) {
          diff[k] = d[k]._id;
        }
      }
      //console.log("diff", diff)
      historyDoc['t'] = new Date();
      historyDoc['o'] = operation;
      historyDoc['d'] = diff;
      historyDoc['m'] = getupdatedetail(diff, schemaname, operation, doc, original);
      historyDoc['schemaname'] = schemaname;
      historyDoc['updatedby'] = req.headers ? req.headers.authkey : null;
      historyDoc['branchid'] = doc.branchid._id;

      //historyDoc = createHistoryDoc(diff, 'u');
      //historyDoc.updatedby = req.headers.authkey;
      //saveHistoryModel(original, d, historyDoc, this.collection.name, next);

    } else {
      var d = this.original;
      historyDoc['t'] = new Date();
      historyDoc['o'] = operation;
      historyDoc['d'] = d;
      historyDoc['m'] = getupdatedetail(d, schemaname, operation, doc, original);
      historyDoc['schemaname'] = schemaname;
      historyDoc['updatedby'] = req.headers.authkey;
      historyDoc['branchid'] = doc.branchid ? doc.branchid._id : null;
      diff = d;
      async.forEachSeries(metadata, (m, next) =>{
        historyDoc[m.key] = m.value; //m.schema || {type: mongoose.Schema.Types.Mixed}
        next();
      }, function(err){
        //historyDoc.updatedby = req.headers.authkey;
        //saveHistoryModel(original, d, historyDoc, collname, next);
      });

    }
    next();
    var history = new hm.HistoryModel(hm.historyCollectionName(this.collection.name, customCollectionName), options)(historyDoc);
    history.save();
    const Workflow  = require('../models/workflow.model');
    //console.log("diff", diff)
    //console.log("history", history)
    Workflow.find({ status: "active",
      "workflowtype": { $ne: "schedule" }
      })
      .then(workflows => {
        if (workflows.length > 0) {
          workflowmatching(history, workflows, obj, diff, req, branch);
        }
      })
  });

  function getupdatedetail(diff, schemaname, operation, doc, original) {
    //console.log("diff", diff.membershipid, original.membershipid)
    var v = {}
    switch (schemaname) {
      case "members":
        if (operation == 'i')
          return "Profile Created"
        else if (operation == 'u') {
          if (diff.membershipid && !original.membershipid) {
            return "Membership assign " + doc.membershipid.membershipname;
          }
          else if (diff.membershipid && original.membershipid) {
            return "Membership renew " + doc.membershipid.membershipname;
          }
          else if (diff.status == 'active') {
            return "Membership Unfreeze";
          }
          else if (diff.status == 'freeze') {
            return "Membership Freeze";
          }
          else if (diff.status == 'Cancelled') {
            return "Membership Cancelled";
          }
          else if (diff.wallets) {
            return "New Wallet Card Issued";
          }
          else if (diff.property) {
            return "Profile Updated";
          }
        }
        break;
      case "payments":
        if (operation == 'i')
          return "Membership Payment Received " + doc["paidamount"]
        else if (operation == 'u') {
          return "Payment Updated"
        }
        break;
      case "facilitybookings":
        if (operation == 'i')
          return "Booking requested - " + doc["refid"]["title"]
        else if (operation == 'u') {
          return "Booking updated"
        }
        break;
      case "appointments":
        if (operation == 'i'){
          var reftitle = "";
          if (doc["refid"] && doc["refid"]["title"]) {
            reftitle = doc["refid"]["title"]
          }
          return "Appointment requested - " + reftitle
        }
        else if (operation == 'u') {
          return "Booking updated"
        }
        break;
      case "bills":
        if (operation == 'i')
          return "Bill generated - " + doc["docnumber"]
        else if (operation == 'u') {
          return "Bill updated"
        }
        break;
      case "billpayments":
        if (operation == 'i')
          return "Bill paid - " + doc["billid"]["docnumber"] + ' Paid amount ' + doc["paidamount"]
        else if (operation == 'u') {
          return "Bill updated"
        }
        break;
      case "creditdebitnotes":
        if (operation == 'i')
          return "Refund paid - " + doc["docnumber"] + ' Paid amount ' + doc["amount"]
        else if (operation == 'u') {
          return "Refund updated"
        }
        break;
      case "wallettxns":
        if (operation == 'i') {
          if (diff.txntype == 'Cr') {
            return "Point Credited -" + doc["value"];
          }
          else if (diff.txntype == 'Dr') {
            return "Point Debited -"  + doc["value"];
          }
        }
        break;
      case "bookings":
          if (operation == 'i')
            return "Booking Requested - " + doc["docnumber"]
          else if (operation == 'u') {
            return "Booking updated"
          }
          break;
      case "formdatas":
        if (operation == 'i'&& diff.formid=='614c3bdefabdbd1eb81541dc')
          return "Complimentary Night Added"
        else if (operation == 'u') {
          return "Refund updated"
        }
        break;
      case "prospects":
        if (operation == 'i')
          return "Profile Created"
        else if (operation == 'u') {
          if (diff.property) {
            return "Profile Updated";
          }
        }
        break;
      default:
        return ""
    }

  }
  // Create an copy when insert or update

  function workflowmatching(history, workflows, obj, diff, req, branch) {

    //console.log("obj", obj)
    var filterworkflows = workflows.filter(function(workflow) {
      var operation = "i";
      if (workflow.triggerprocess.toLowerCase() == "create") {
        operation = "i";
      }
      else if (workflow.triggerprocess.toLowerCase() == "edit" || workflow.triggerprocess.toLowerCase() == "field_update") {
        operation = "u";
      }
      else if (workflow.triggerprocess.toLowerCase() == "remove") {
        operation = "d";
      }
      else if (workflow.triggerprocess.toLowerCase() == "create or edit") {
        operation = "iu";
      }

      if (operation != "iu" && operation == history.o && history.schemaname == "formdatas" && history.d.formid._id.toString() == workflow.formid._id.toString())
      {
        return workflow;
      }
      else if (operation == "iu" && (history.o == "i" || history.o == "u") && history.schemaname  == "formdatas" && history.d.formid._id.toString() == workflow.formid._id.toString())
      {
        return workflow;
      }
      else if (operation == history.o && history.schemaname != "formdatas" && history.schemaname == workflow.formid.schemaname)
      {
        return workflow;
      }
      else if (operation == "iu" && (history.o == "i" || history.o == "u") && history.schemaname != "formdatas" && history.schemaname == workflow.formid.schemaname)
      {
        return workflow;
      }
      else if (workflow.workflowtype == "disposition"
          &&  history.d.dispositionid && workflow.disposition && history.d.dispositionid.toString() == workflow.disposition._id.toString())
      {
        return workflow;
      }

    });

    var updatefields = [];
    var conditionmatch = true;
    //console.log("filterworkflows", filterworkflows);

    filterworkflows.forEach(function (workflow) {
      //console.log("filterworkflows", workflow._id);
      if (workflow.trigger) {
        updatefields = workflow.trigger.fields;
      }
      else {
        conditionmatch = true;
      }

      if (!updatefields) updatefields = [];

      var changes = history.d;
      var rule = workflow.trigger.triggerRules;
      //console.log("changes", changes)
      if (updatefields.length == 0) conditionmatch = true;
      for (var i = 0; i < updatefields.length; i++) {

        var field = updatefields[i];

        if (field) {
          var db_fieldValue;
          var fieldnameSplit = field.split('.');
          db_fieldValue = null;

          if (changes) {
            if (fieldnameSplit[1] == undefined || fieldnameSplit[1] == null) {
              var fieldname1 = fieldnameSplit[0];
              db_fieldValue = changes[fieldname1];
            } else {
              var fieldname1 = fieldnameSplit[0];
              var fieldname2 = fieldnameSplit[1];

              if (fieldname1 && fieldname2) {

                if (changes[fieldname1]) {
                  if (changes[fieldname1][fieldname2]) {
                    db_fieldValue = changes[fieldname1][fieldname2];
                  }
                }
              }

            }

          }
          //console.log("db_fieldValue", field, db_fieldValue)
          if (db_fieldValue || db_fieldValue != undefined) {
            conditionmatch = true;
            if (rule == "or") break;
          }
          else {
            conditionmatch = false;
            if (rule == "all") break;
          }
        }
      }
      //console.log("conditionmatch", conditionmatch)
      // console.log("history", history)
      if (conditionmatch) {
        //console.log("workflow 1", workflow._id)
        workflowmatching2(workflow, history, obj, diff, req, branch)
      }

    });

  }

  function workflowmatching2(workflow, history, obj, diff, req, branch) {

    const common  = require('../helpers/common');
    //console.log("obj", obj)
    history = history.d;
    //console.log("history", history);
    var schema = workflow.formid.schemaname;
    var workflow = workflow;
    var conditionmatch = false;

    var criteria = [];

    if (workflow.workflowtype == "disposition" && (!obj.dispositionid && !obj.customerid)) {
      conditionmatch = false;
    }
    else if (workflow.criteriaRules == 'filterRecords' && workflow.criteria.length > 0) {

      criteria = workflow.criteria;
      conditionmatch = false;
      let tempFlag;
      // console.log("criteria", workflow.criteria);
      tempFlag = false;
      for (var j = 0; j < criteria.length; j++) {
        var cond = criteria[j];
        if (cond["fieldvalue"] && cond["fieldname"] && cond["operator"]) {
          var operator = cond["operator"];
          var db_fieldValue;
          var fieldnameSplit = cond["fieldname"].split('.');

          if (fieldnameSplit[1] == undefined || fieldnameSplit[1] == null) {
            var fieldname1 = fieldnameSplit[0];
            if (obj[fieldname1]) {
              db_fieldValue = obj[fieldname1];
            }
          } else {
            var fieldname1 = fieldnameSplit[0];
            var fieldname2 = fieldnameSplit[1];
            if (obj[fieldname1][fieldname2]) {
              db_fieldValue = obj[fieldname1][fieldname2];
            }
          }

          if (db_fieldValue) {
            switch (operator) {
              case 'exists':
                if (db_fieldValue) {
                  tempFlag = true;
                } else {
                  tempFlag = false;
                }
                break;
              case 'is':
              case '=':
                if (cond['fieldtype'] == 'Date' || cond['fieldtype'] == 'datepicker') {
                  var d1 = new Date(db_fieldValue);
                  var d2 = new Date(cond["fieldvalue"]);
                  if (d1.getTime() === d2.getTime()) {
                    tempFlag = true;
                  } else {
                    tempFlag = false;
                  }
                } else if (cond['fieldtype'] == 'ObjectId') {
                  var db_fieldValue = db_fieldValue._id;
                  if (db_fieldValue.toString() == cond["fieldvalue"].toString()) {
                    tempFlag = true;
                  } else {
                    tempFlag = false;
                  }
                }
                else {
                  if (db_fieldValue.toString() == cond["fieldvalue"].toString()) {
                    tempFlag = true;
                  } else {
                    tempFlag = false;
                  }
                }
                break;
              case 'isnt':
              case '!=':
                ////console.log(db_fieldValue.toString(), cond["fieldvalue"].toString())
                if (cond['fieldtype'] == 'Date' || cond['fieldtype'] == 'datepicker') {
                  var d1 = new Date(db_fieldValue);
                  var d2 = new Date(cond["fieldvalue"]);
                  if (d1.getTime() !== d2.getTime()) {
                    tempFlag = true;
                  } else {
                    tempFlag = false;
                  }
                } else if (cond['fieldtype'] == 'ObjectId') {
                  var db_fieldValue = db_fieldValue._id;
                  if (db_fieldValue.toString() !== cond["fieldvalue"].toString()) {
                    tempFlag = true;
                  } else {
                    tempFlag = false;
                  }
                }
                else {
                  if (db_fieldValue.toString() !== cond["fieldvalue"].toString()) {
                    tempFlag = true;
                  } else {
                    tempFlag = false;
                  }
                }
                break;
              case 'contains':

                var cond_fieldvalue = cond["fieldvalue"];
                if (db_fieldValue.indexOf(cond_fieldvalue) !== -1) {
                  tempFlag = true;
                } else {
                  tempFlag = false;
                }
                break;
              case 'in':

                var cond_fieldvalue = cond["fieldvalue"];
                if (cond_fieldvalue.includes(db_fieldValue)) {
                  tempFlag = true;
                } else {
                  tempFlag = false;
                }
                break;
              case 'nin':

                var cond_fieldvalue = cond["fieldvalue"];
                if (cond_fieldvalue.includes(db_fieldValue)) {
                  tempFlag = false;
                } else {
                  tempFlag = true;
                }
                break;
              case 'doesnt_contain':
                var cond_fieldvalue = cond["fieldvalue"];
                if (db_fieldValue.indexOf(cond_fieldvalue) == -1) {
                  tempFlag = true;
                } else {
                  tempFlag = false;
                }
                break;
              case 'starts_with':
                var cond_fieldvalue = cond["fieldvalue"];
                if (db_fieldValue.startsWith(cond_fieldvalue)) {
                  tempFlag = true;
                } else {
                  tempFlag = false;
                }
                break;
              case 'ends_with':
                var cond_fieldvalue = cond["fieldvalue"];
                if (db_fieldValue.endsWith(cond_fieldvalue)) {
                  tempFlag = true;
                } else {
                  tempFlag = false;
                }
                break;
              case 'is_empty':
                if (db_fieldValue.length == 0) {
                  tempFlag = true;
                } else {
                  tempFlag = false;
                }
                break;
              case 'is_not_empty':
                if (db_fieldValue.length !== 0) {
                  tempFlag = true;
                } else {
                  tempFlag = false;
                }
                break;
              case '>':
                if (db_fieldValue > cond["fieldvalue"]) {
                  tempFlag = true;
                } else {
                  tempFlag = false;
                }
                break;
              case '>=':
                if (db_fieldValue >= cond["fieldvalue"]) {
                  tempFlag = true;
                } else {
                  tempFlag = false;
                }
                break;
              case '<':
                if (db_fieldValue < cond["fieldvalue"]) {
                  tempFlag = true;
                } else {
                  tempFlag = false;
                }
                break;
              case '<=':
                if (db_fieldValue <= cond["fieldvalue"]) {
                  tempFlag = true;
                } else {
                  tempFlag = false;
                }
                break;
              case 'between':
                if (cond['fieldtype'] == 'Date' || cond['fieldtype'] == 'datepicker') {
                  var db_date = new Date(db_fieldValue);
                  var criteria_date1 = new Date(cond["fieldvalue"]);
                  var criteria_date2 = new Date(cond["fieldvalue2"]);
                  if (db_date > criteria_date1 && db_date < criteria_date2) {
                    tempFlag = true;
                  } else {
                    tempFlag = false;
                  }
                } else {
                  if (db_fieldValue >= cond["fieldvalue"] && db_fieldValue <= cond["fieldvalue2"]) {
                    tempFlag = true;
                  } else {
                    tempFlag = false;
                  }
                }
                break;
              case 'not_between':
                if (cond['fieldtype'] == 'Date' || cond['fieldtype'] == 'datepicker') {
                  var db_date = new Date(db_fieldValue);
                  var criteria_date1 = new Date(cond["fieldvalue"]);
                  var criteria_date2 = new Date(cond["fieldvalue2"]);
                  if (db_date > criteria_date1 && db_date < criteria_date2) {
                    tempFlag = false;
                  } else {
                    tempFlag = true;
                  }
                } else {
                  if (db_fieldValue >= cond["fieldvalue"] && db_fieldValue <= cond["fieldvalue2"]) {
                    tempFlag = false;
                  } else {
                    tempFlag = true;
                  }
                }
                break;
              case 'is_before':
                var db_date = new Date(db_fieldValue);
                var criteria_date = new Date(cond["fieldvalue"]);
                if (criteria_date.getTime() <= db_date.getTime()) {
                  tempFlag = true;
                } else {
                  tempFlag = false;
                }
                break;
              case 'is_after':
                var db_date = new Date(db_fieldValue);
                var criteria_date = new Date(cond["fieldvalue"]);
                if (criteria_date >= db_date) {
                  tempFlag = true;
                } else {
                  tempFlag = false;
                }
                break;
              case 'age_in_days':
                var today_date = new Date();
                var criteria_date = new Date(db_fieldValue);

                var timeDiff = Math.abs(criteria_date.getTime() - today_date.getTime());
                var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

                if (diffDays == cond["fieldvalue"]) {
                  tempFlag = true;
                } else {
                  tempFlag = false;
                }
                break;
              case 'due_in_days':

                var today_date = new Date();
                var database_date_temp = new Date();

                var days = cond["fieldvalue"];
                var expected_date = new Date(today_date.getTime() + days * 24 * 60 * 60 * 1000);
                var database_date = new Date(database_date_temp.getTime() + days * 24 * 60 * 60 * 1000);

                if (database_date.getTime() == expected_date.getTime()) {
                  tempFlag = true;
                } else {
                  tempFlag = false;
                }
                break;
            }
          }
          // //console.log("tempFlag", tempFlag)
          // //console.log("workflow.criteria_pattern", workflow.criteria_pattern)
          if (workflow.criteria_pattern == 'AND' && !tempFlag) {
            conditionmatch = false;
            break;
          } else if ((!workflow.criteria_pattern || workflow.criteria_pattern == 'OR') && tempFlag) {
            conditionmatch = true;
            break;
          } else if (!workflow.criteria_pattern && !tempFlag) {
            conditionmatch = false;
            break;
          }
        }
      }
      conditionmatch = tempFlag;
    }
    else {
      conditionmatch = true;
    }

    // console.log("conditionmatch 2", conditionmatch)
    if (conditionmatch) {
      if (workflow.workflowtype == "disposition" && history.contextid) {
        property = history.property;
      }
      if ((workflow.approvers || workflow.reviewers) && !obj.wfstatus)
      {
        if (workflow.approvers && (workflow.approvers.userid.length > 0 || workflow.approvers.roleid.length > 0)) {

          MongoClient.connect(url, function (err, client) {
            var db = client.db();
            db.collection(schema).findOneAndUpdate({ _id: ObjectID(obj._id) }, { $set: { wfstatus: "Pending", wfapprovers: workflow.approvers} }, { updated:true })
              .then(() => {
                common.createactivity(obj, workflow.approvers, workflow.formid, req);
                if (client) client.close();
              });

          });

        }

        if (workflow.reviewers && (workflow.reviewers.userid.length > 0 || workflow.reviewers.roleid.length > 0)) {

          MongoClient.connect(url, function (err, client) {
            var db = client.db();
            db.collection(schema).findOneAndUpdate({ _id: ObjectID(obj._id) }, { $set: { wfstatus: "Pending", wfreviewers: workflow.reviewers} }, { updated:true })
              .then(() => {
                common.createactivity(obj, workflow.reviewers, workflow.formid, req);
                if (client) client.close();
              });

          });

        }
      }
      else if ((workflow.approvers || workflow.reviewers) && ((obj.wfstatus=="Approved") || (obj.wfstatus=="Declined")))
      {
        if (workflow.approvers && (workflow.approvers.userid.length > 0 || workflow.approvers.roleid.length > 0)) {

          var userid = req.body.authkey._id;
          var roleid = req.body.authkey.role._id;
          console.log(userid, roleid)
          console.log(workflow.approvers.userid, workflow.approvers.roleid)
          var matchuser = workflow.approvers.userid.includes(userid)
          var matchrole = workflow.approvers.roleid.includes(roleid)
          console.log(matchuser, matchrole)
          if (!matchuser && !matchrole){

            MongoClient.connect(url, function (err, client) {
              var db = client.db();
              db.collection(schema).findOneAndUpdate({ _id: ObjectID(obj._id) }, { $set: { wfstatus: "Pending", wfapprovers: workflow.approvers} }, { updated:true })
                .then(() => {
                  common.createactivity(obj, workflow.approvers, workflow.formid, req);
                  if (client) client.close();
                });

            });
          }

        }

      }
      console.log("workflow", workflow._id)
      common.generateobject(workflow.action, history, obj, diff, req, branch);
    }

  }

};

