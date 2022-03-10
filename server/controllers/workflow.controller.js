const Joi = require('joi');
var ObjectID = require('mongodb').ObjectID;
var url = process.env.MONGO_HOST;
var MongoClient = require('mongodb').MongoClient;
const common = require('../helpers/common');
import async from "async";
const Workflow = require('../models/workflow.model');
const Schedulerview = require('../views/scheduler.view');
const Paymentschedule = require('../models/paymentschedule.model');
const Member = require('../models/member.model');
const User = require('../models/user.model');
const Formdata = require('../models/formdata.model');
const Appointment = require('../models/appointment.model');
const Facilitybooking = require('../models/facilitybooking.model');

const workflowSchema = Joi.object({
  title: Joi.string().required(),
  formid: Joi.string().hex().required(),
  feedbackformid: Joi.string().hex(),
  description: Joi.string().allow(null),
  triggerprocess: Joi.string().allow(null),
  triggerRules: Joi.string().allow(null),
  trigger: Joi.object(),
  scheduleaction: Joi.object(),
  criteria: Joi.array(),
  action: Joi.object(),
  disposition: Joi.string().hex(),
  criteriaRules: Joi.string().allow(null),
  criteria_pattern: Joi.string().allow(null),
  workflowtype: Joi.string().allow(null),
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
  generatenotification
}


async function generatenotification(req) {

  var leavebalance = []

  Schedulerview.find({ status: "active" }).exec(function (err, schedulers) {

    MongoClient.connect(url, function (err, client) {

      var db = client.db();

      async.forEachSeries(schedulers, (scheduler, next) => {
        //console.log(scheduler)
        var timezone = scheduler.branchid ? scheduler.branchid.timezone : "Asia/Kolkata"
        var locale = "en-US";
        var date = new Date();
        var options = {
          hour: 'numeric',
          hour12: false,
          timeZone: timezone ? timezone : "Asia/Kolkata"
        };

        var hour = Intl.DateTimeFormat(locale, options).format(date)

        var d = new Date(); /* midnight in China on April 13th */
        var offset = new Date(d.toDateString('en-US', { timeZone: timezone })).getTimezoneOffset();        

        var scheduleaction = scheduler.property.scheduleaction
        //console.log("hour 1", hour, scheduler.formname, scheduler.branchid._id)
        if (hour == 8 && scheduleaction) {
          //console.log("scheduler", scheduler.formname, scheduler.branchid._id)
          //console.log("hour 2", hour)
          var workflow = scheduler.workflowid;
          var workflowmatch = common.workflowcriteria(workflow);

          var filter = scheduler.property.criteria
          var trigger_field = scheduleaction.fieldname;
          var today = new Date();
          if (scheduleaction.executiondate.time == '-1') {

            var scheduledate = today.setDate(today.getDate() + parseInt(scheduleaction.executiondate.days));

          } else if (scheduleaction.executiondate.time == '1') {

            var scheduledate = today.setDate(today.getDate() - parseInt(scheduleaction.executiondate.days));

          } else if (scheduleaction.executiondate.time == '0') {
            var scheduledate = today.setDate(today.getDate() - 0);
          }

          var findldate = new Date(scheduledate);

          if (offset < 0) 
            findldate.setDate(findldate.getDate() - 1)

          var day = findldate.getDate();
          var month = findldate.getMonth() + 1;          
          var fullyear = findldate.getFullYear();

          var trigger_field_db = '$' + trigger_field;
          if (scheduleaction.occurrence.toLowerCase() == 'once' || scheduleaction.occurrence.toLowerCase() == 'on') {

            var addfields = {
              day: { "$dayOfMonth": trigger_field_db },
              month: { "$month": trigger_field_db },
              year: { "$year": trigger_field_db }
            };

            var match = { 
              "day": { $eq: day },
              "month": { $eq: month },
              "year": { $eq: fullyear }
            }


          } else if (scheduleaction.occurrence.toLowerCase() == 'before') {

            var addfields = {
              day: { "$dayOfMonth": trigger_field_db },
              month: { "$month": trigger_field_db },
              year: { "$year": trigger_field_db }
            }; 
            var today = new Date();
            today = today.getDate();

            var match = { 
              "day": { 
                "$lte": day,
                "$gte": today
              },
              "month": { $eq: month },
              "year": { $eq: fullyear }
            }


          } else if (scheduleaction.occurrence.toLowerCase() == 'yearly') {

            var addfields = {
              day: { "$dayOfMonth": trigger_field_db },
              month: { "$month": trigger_field_db }
            };
            var match = {
              "day": { $eq: day },
              "month": { $eq: month }
            }
          } else if (scheduleaction.occurrence.toLowerCase() == 'monthly') {

            var addfields = {
              day: { "$dayOfMonth": trigger_field_db }
            };
            var match = {
              "day": { $eq: day }
            }
          }

          // Date type check 
          var datecheck = {}
          datecheck[trigger_field] = {  "$exists": true ,  $ne: null, $type: 9 };
          
          var addfield = { $addFields: addfields }
          var matches = { $match: match }
          var branch = { $match: { branchid: scheduler.branchid._id } }
          var agg = []
          agg.push({ "$match": datecheck })
          agg.push(addfield)
          agg.push(matches)
          agg.push(branch)

          if (Object.keys(workflowmatch).length !== 0 && workflowmatch.constructor === Object)
            agg.push(workflowmatch)
 
          filter.forEach(filter => {
            var fieldname = filter["fieldname"]
            var obj = {};
            obj[fieldname] = filter.fieldvalue
            var search = { "$match": obj }
            agg.push(search)
          })
          db.collection(workflow.formid.schemaname).aggregate(agg).toArray(function (err, arrys) {
            // console.log(workflow.formid.schemaname)
            // console.log(workflow.title, workflow.title)
            //console.log(JSON.stringify(agg))
            //console.log(arrys)
            
            if (arrys && arrys.length == 0) next();
            else {
              async.forEachSeries(arrys, (obj, next1) => {
                
                var action = workflow.action;
                if (workflow.formid.schemaname == "paymentschedules") {
                  Paymentschedule.findById(obj._id)
                    .lean({ virtuals: true, autopopulate: { maxDepth: 2 } })
                    .then((original) => {
                      common.generateobject(action, null, original, null, req, scheduler.branchid);
                    }) 
                }
                else if (workflow.formid.schemaname == "members") {
                  Member.findById(obj._id)
                    .lean({ virtuals: true, autopopulate: { maxDepth: 2 } })
                    .then((original) => {
                      //console.log("original", original._id, scheduler.formname, scheduler.branchid._id)
                      common.generateobject(action, null, original, null, req, scheduler.branchid);
                    })
                }
                else if (workflow.formid.schemaname == "formdatas") {
                  Formdata.findById(obj._id)
                    .lean({ virtuals: true, autopopulate: { maxDepth: 2 } })
                    .then((original) => {
                      // console.log("original", original)
                      common.generateobject(action, null, original, null, req, scheduler.branchid);
                    })
                }
                else if (workflow.formid.schemaname == "users") {
                  User.findById(obj._id)
                    .lean({ virtuals: true, autopopulate: { maxDepth: 2 } })
                    .then((original) => {
                     // console.log("original", original)
                      common.generateobject(action, null, original, null, req, scheduler.branchid);
                    })
                }
                else if (workflow.formid.schemaname == "appointments") {
                  Appointment.findById(obj._id)
                    .populate("branchid")
                    .lean({ virtuals: true, autopopulate: { maxDepth: 2 } })
                    .then((original) => {
                      common.generateobject(action, null, original, null, req, scheduler.branchid);
                    })
                }
                else if (workflow.formid.schemaname == "facilitybookings") {
                  Facilitybooking.findById(obj._id)
                    .populate("branchid")
                    .lean({ virtuals: true, autopopulate: { maxDepth: 2 } })
                    .then((original) => {
                      common.generateobject(action, null, original, null, req, scheduler.branchid);
                    })
                }

                next1();


              }, function () {
                next();
              });
            }

          });

        }
        else next();

      }, function () {
        if (client) client.close();
      });

    })

  });

  //// Check Membership Expiry
  // var yesterday = new Date();
  // yesterday.setTime(0)
  var today = new Date();
  today.setTime(today.getTime() + 0)
  Member.find({ membershipend: { "$lte": today }, status: "active" })
    .then((members) => {
      members.forEach(function (member) {

        // member.status = "Expired"
        //console.log(member.membernumber, ',' , member.fullname, ',' , member.membershipid.membershipname, ',' , member.membershipend)
        // member.save()
        //       .then();
        Member.findByIdAndUpdate(member._id, { "$set": { status: "deactive" } }).then((mem) => console.log(mem))

      });

    })

  // adjust leave balance
  var today = new Date()
  var dayOfMonth = today.getDate();

  if (dayOfMonth == 1)
    User.find({ status: "active" })
      .then((users) => {

        var leavebalance = []
        users.forEach((user) => {

          if (user.leavecomponents.length > 0) {

            user.leavecomponents.forEach((leavecomponent) => {

              var leavecomponentid = leavecomponent.leavecomponentid;
              var leavepolicy = leavecomponentid.property;
              var noofleave = 0;
              if (!leavepolicy.accrual_amount) return
              if (leavepolicy.accrual_type == "Yearly") {
                noofleave = leavepolicy.accrual_amount / 12;
                noofleave = noofleave.toFixed(2);
              }
              else {
                noofleave = leavepolicy.accrual_amount
              }
              var leave = {
                formid: "60b7392f99e17f765884f426",
                property: {
                  note: "Accrual Leave added",
                  leavecomponentid: leavecomponentid._id,
                  date: new Date(),
                  quantity: noofleave
                },
                contextid: user._id,
                onModel: "User"
              }

              leavebalance.push(leave)

            })
          }

        })

        if (leavebalance.length > 0) {
          Formdata.insertMany(leavebalance)
        }

      })

}

async function findbyId(Id) {
  return await Workflow.findById(Id);
}

async function insert(req) {
  var workflow = {
    title: req.body.title,
    formid: req.body.formid,
    description: req.body.description,
    triggerprocess: req.body.triggerprocess,
    triggerRules: req.body.triggerRules,
    trigger: req.body.trigger,
    scheduleaction: req.body.scheduleaction,
    criteria: req.body.criteria,
    action: req.body.action,
    feedbackformid: req.body.feedbackformid,
    disposition: req.body.disposition,
    criteriaRules: req.body.criteriaRules,
    criteria_pattern: req.body.criteria_pattern,
    workflowtype: req.body.workflowtype,
    property: req.body.property
  }

  await Joi.validate(workflow, workflowSchema, { abortEarly: false });
  return await new Workflow(workflow).save(req);
}

async function update(Id, req) {

  var workflow = await Workflow.findById(Id);
  workflow._original = workflow.toObject();
  workflow.title = req.body.title,
    workflow.formid = req.body.formid,
    workflow.description = req.body.description,
    workflow.triggerprocess = req.body.triggerprocess,
    workflow.triggerRules = req.body.triggerRules,
    workflow.trigger = req.body.trigger,
    workflow.scheduleaction = req.body.scheduleaction,
    workflow.criteria = req.body.criteria,
    workflow.disposition = req.body.disposition,
    workflow.action = req.body.action,
    workflow.feedbackformid = req.body.feedbackformid,
    workflow.criteriaRules = req.body.criteriaRules,
    workflow.criteria_pattern = req.body.criteria_pattern,
    workflow.workflowtype = req.body.workflowtype,
    workflow.property = req.body.property
  return await workflow.save(req);
}

async function remove(Id, req) {
  var workflow = await Workflow.findById(Id);
  workflow.status = "deleted"
  return await workflow.save(req);
}

async function filter(params) {
  return await Workflow.getbyfilter(params)
}

async function findcount(req) {
  return await Workflow.findcount(req)
}

async function exportdata(params) {
  return await Workflow.exportdata(params)
}
