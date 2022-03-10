const Joi = require('joi');
const Activity = require('../models/activity.model');
const Activityview = require('../views/activity.view');
const Jobactivityview = require('../views/jobactivity.view');
const Crmappview = require('../views/crmapp.view');
const Enquiry = require('../models/enquiry.model');

const activitySchema = Joi.object({
  dispositionid: Joi.string().hex(),
  type: Joi.string(),
  customerid: Joi.string().hex().required(),
  serviceid: Joi.string().hex(),
  onModel: Joi.string(),
  refid: Joi.string().hex().allow(''),
  onRefModel: Joi.string(),
  duedate: Joi.date(),
  status: Joi.string(),
  assingeeuser: Joi.string().hex().allow(null),
  property: Joi.object()
})


module.exports = {
  insert,
  update,
  patch,
  filter,
  findbyId,
  filterview,
  jobactivityview,
  crmappview,
  findcount,
  exportdata,
  updatetasks,
  checkrule
}

async function updatetasks(req) {

  var joborder = req.body.joborder;
  var services = joborder.services;
  var body = req.body;
  var tasks = await Activity.find({ refid: joborder._id});
  if (services) {
    services.forEach(async (service) => {
      var findservice = tasks.find(p => p.serviceid && p.serviceid._id && p.serviceid._id.toString() == service.refid._id.toString());
      if (!findservice) {

        var activity = {
          customerid: joborder.assetid._id.toString(),
          serviceid: service.refid._id.toString(),
          type: "task",
          onModel: "Asset",
          status: "active",
          duedate: joborder.duedate,
          property: {},
          assingeeuser: service && service.assignee && service.assignee._id ? service.assignee._id.toString() : null,
          refid: joborder._id.toString(),
          onRefModel: "Joborder"
        }
        activity = await Joi.validate(activity, activitySchema, { abortEarly: false });
        await new Activity(activity).save(req);
      }
    });
  }
  return;

}

async function findbyId(Id) {
  return await Activity.findById(Id);
}

async function insert(req) {

  var body = req.body;
  var activity = {
    dispositionid: body.dispositionid,
    type: body.type,
    customerid: body.customerid,
    onModel: body.onModel,
    refid: body.refid,
    onRefModel: body.onRefModel,
    duedate: body.duedate,
    status: body.status,
    property: body.property,
    assingeeuser: body.assingeeuser 
  }

  if (activity.status == 'close' && activity.duedate) {
    activity.assingeeuser = body.authkey._id.toString();
    activity.duedate = undefined;
  }
  activity = await Joi.validate(activity, activitySchema, { abortEarly: false });
  activity = await new Activity(activity).save(req); 
  
  if (body.status == 'close' && (body.duedate || body.property.followupdate)) {

    var duedate = body.duedate ? body.duedate : activity.property.followupdate
    var assingeeuser = body.assingeeuser ? body.assingeeuser : activity.property.assignto    
    
    var newactivity = {
      dispositionid: body.dispositionid,
      type: body.type,
      customerid: body.customerid,
      onModel: body.onModel,
      addedby: req.body.authkey._id,
      property: body.property,
      duedate: duedate,
      status: "followup",
      branchid: body.authkey.branchid._id,
      assingeeuser: assingeeuser.toString()
    }
    Activity.findOneAndUpdate({ customerid: body.customerid, status: "followup" }, { "$set": newactivity }, { upsert: true }).then();
  }

  if (body.onModel == "Enquiry") {
    Enquiry.findByIdAndUpdate(body.customerid, { "$inc": { transactions: 1 }, "$set": { dispositionid: activity.dispositionid, handlerid: assingeeuser } }).then();
  }
  return activity;
}

async function update(Id, req) {
  var body = req.body;
  var activity = await Activity.findById(Id);
  activity._original = activity.toObject();
  activity.dispositionid = body.dispositionid,
  activity.type = body.type,
  activity.customerid = body.customerid,
  activity.onModel = body.onModel,
  activity.refid = body.refid,
  activity.onRefModel = body.onRefModel,
  activity.duedate = body.duedate,
  activity.status = body.status,
  activity.property = body.property,
  activity.assingeeuser = body.assingeeuser
  return await activity.save(req)
}

async function patch(Id, req) {
  var activity = await Activity.findById(Id);
  activity._original = activity.toObject();
  activity.property = req.body.property,
  activity.status = req.body.status
  return await activity.save(req)
}

async function filter(req) {
  return await Activity.getbyfilter(req)
}

async function filterview(req) {
  return await Activityview.getfilterview(req)
}

async function crmappview(req) {
  return await Crmappview.filter(req)
}

async function jobactivityview(req) {
  return await Jobactivityview.getfilterview(req)
}

async function findcount(params) {
  return await Activity.findcount(params)
}

async function exportdata(params) {
  return await Activity.exportdata(params)
}


async function checkrule(req, res, next) {

  var disposition = req.body;
  var formid = data.formid;

  Dispositionrule.find({ formid: formid, status: "active" }).then((rules) => {

              async.forEachSeries(rules, (rule, next) => {
                applyrule(rule, data, req);
                next();
              });

  });
    if (res){
      return res.json(data);// next();
    }
    else return;
}

function applyrule(rule, disposition, req){

  var userid = req.body.authkey._id
  var dispositionid = mongoose.Types.ObjectId(disposition.dispositionid);
  
  if (rule.trigger=="Disposition Updated" && disposition.property[rule["condition"][0]["fieldname"]] == rule["condition"][0]["fieldvalue"]){

      if (rule.dispositionid.toString() != dispositionid.toString()) return;

      if (rule.action == "Create Task" && disposition.status=="done") {
          var taskid = rule.actionvalue;
          taskid = mongoose.Types.ObjectId(taskid)
          Task.findById(taskid)
              .then((t) =>{

                if (t){

                  var duedate = new Date();
                  var adddays = parseInt(t.duedate["dueday"]);
                  duedate.setDate(duedate.getDate() + adddays);

                  var contextid =  mongoose.Types.ObjectId(disposition.contextid);

                  async.waterfall([
                          next => {
                            Member.findById(contextid)
                              .populate('membershipid')
                              .populate('classid')
                              .populate('branchid')
                              .populate('paymentterms')
                              .populate({ path: "paymentterms", populate: {path : 'paymentitem'} })
                              .populate({ path: "paymentterms", populate: {path : 'taxes' } })
                              .populate('addedby')
                              .then((member) => {
                                  next(null , member)
                              })
                          },
                          (member,next) =>{

                                var str = regexrep(t.description, member);
                                var formid = t.formid
                                const usertask = new Usertask({
                                  title: t.taskname,
                                  description: str,
                                  priority: t.priority,
                                  owner: t.owner,
                                  displaywebparts: t.displaywebparts,
                                  dispositionid: t.dispositionid,
                                  contextid: contextid,
                                  assingeeuser: t.assingeeuser,
                                  assingeerole: t.assingeerole,
                                  duedate: duedate,
                                  notes: t.notes
                                });

                                if (formid=="5af03fe1dbd19f20e03ac67c"){
                                  usertask.onModel = "Prospect"
                                }
                                else if (formid=="599673a925f548d7dbbd7c86"){
                                  usertask.onModel = "Member"
                                }
                                else if (formid=="59f430a7bd4e4bb2fb72ec7d"){
                                  usertask.onModel = "Promotion"
                                }
                                else if (formid=="598998cb6bff2a0e50b3d793"){
                                  usertask.onModel = "User"
                                }
                                else {
                                  usertask.onModel = "Formdata"
                                }

                                usertask.save()
                                  .then(h => {});
                              }
                            ])
                }
              })
      }
      else if (rule.action == "Change handler") {
          var assignid = rule.actionvalue;
          assignid = mongoose.Types.ObjectId(assignid)

          var taskid = disposition.objectid;
          taskid = mongoose.Types.ObjectId(taskid)

          Usertask.findById(taskid._id)
              .then((task) => {
                if (task){
                  task.assingeeuser = assignid;
                  task.save()
                      .then((t) => { })
                }
              })
      }
      else if (rule.action == "Permission" && disposition.dispositionid.toString() == rule.dispositionid.toString()) {

        var contextid =  mongoose.Types.ObjectId(disposition.contextid);

        Dispositionpermission.findOne({ contextid: contextid }).then(
          (dispositionpermission) => {

            if (dispositionpermission) {
              dispositionpermission.userid = rule.userid;
              dispositionpermission.roleid = rule.roleid;
              dispositionpermission.permissions = rule.permissions;
            } else {
              dispositionpermission = new Dispositionpermission({
                contextid: contextid,
                userid: rule.userid,
                roleid: rule.roleid,
                permissions: rule.permissions,
              });

            }

            dispositionpermission.save().then((h) => {});

          }
        );

      }
  }
  else if (rule.trigger=="Disposition Change" && rule.todispositionid && rule.todispositionid.toString()==dispositionid.toString()){

    if (rule.action == "Change handler") {
      var assignid = rule.actionvalue;
      assignid = mongoose.Types.ObjectId(assignid)

      var taskid = disposition.objectid;
      taskid = mongoose.Types.ObjectId(taskid)

      Usertask.findById(taskid._id)
          .then((task) => {
            if (task){
              task.assingeeuser = assignid;
              task.save()
                  .then((t) => { })
            }
          })
    }
    else if (rule.action == "Call api") {
      //console.log("rule", rule);
      var url = rule.actionvalue;
      callapi(disposition, url)
    }
    else if (rule.action == "Mapped Object") {
      mappedobject(rule, disposition, userid)
    }
    else if (rule.action == "Update Object") {
      updateobject(rule, disposition, userid)
    }
    else if (rule.action == "Update Status") {
      updatestatus(rule, disposition, userid)
    }
    else if (rule.action == "Permission") {

      var contextid =  mongoose.Types.ObjectId(disposition.contextid);

      Dispositionpermission.findOne({ contextid: contextid }).then(
        (dispositionpermission) => {

          if (dispositionpermission) {
            dispositionpermission.userid = rule.userid;
            dispositionpermission.roleid = rule.roleid;
            dispositionpermission.permissions = rule.permissions;
          } else {
            dispositionpermission = new Dispositionpermission({
              contextid: contextid,
              userid: rule.userid,
              roleid: rule.roleid,
              permissions: rule.permissions,
            });

          }

          dispositionpermission.save().then((h) => {});

        }
      );

    }
  }

}

function mappedobject(rule, disposition, userid) {

  var formid = disposition.formid;
  var objectid = disposition.objectid;
  var mapobject = rule.mapobject;
  MongoClient.connect(url, function (err, db) {

    db.collection("forms").findOne({ _id: new ObjectID(formid) })
      .then(doc => {

        var schema = doc.schemaname;
        var newobject = {};
        var newschema;
        db.collection(schema).findOne({ _id: new ObjectID(objectid) })
           .then(obj => {
            if (obj) {

              var newform = mapobject[0].formname;
              db.collection("forms").findOne({ formname: newform })
              .then(mapform => {

                      newschema = mapform.schemaname;

                      for (var prop in obj) {
                        if (prop!="_id" && prop!="stage"){
                          newobject[prop] = obj[prop];
                        }
                      }
                      var prop = obj["property"];
                      for (var property in prop) {
                          newobject["property"][property] = prop[property];
                      }
                      newobject["addedby"] = userid;
                      newobject["stage"] = "NEW";
                      newobject["disposition"] = disposition.property;
                      newobject.status = "active";
                      var prospect = new Prospect();
                      for (var property in newobject) {
                        if (property=="property"){
                          var prop = newobject[property];
                          prospect["property"] = prop;
                        }
                        else
                        prospect[property] = newobject[property];
                      }
                      prospect.save().then()
                      db.collection(schema).findOneAndUpdate({ _id: new ObjectID(objectid) }, { "$set": { status: "converted" } }).then((obj1)=> console.log(obj1));

              })

            }
        })

      })

  });

}

function updatestatus(rule, disposition, userid) {

  var formid = disposition.formid;
  var objectid = disposition.objectid;
  MongoClient.connect(url, function (err, db) {

    db.collection("forms").findOne({ _id: new ObjectID(formid) })
      .then(doc => {

        var schema = doc.schemaname;
        db.collection(schema).findOne({ _id: new ObjectID(objectid) })
           .then(obj => {
            if (obj) {

              var prop = obj["property"];
              db.collection(schema)
                .findOneAndUpdate(
                  { _id: new ObjectID(objectid) },
                  { $set: { status: rule.actionvalue, stage: "NEW", property: prop } }
                )
                .then((obj1) => console.log(obj1));
            }
        })

      })

  });

}

function updateobject(rule, disposition, userid) {

  var formid = disposition.formid;
  var objectid = disposition.objectid;
  MongoClient.connect(url, function (err, db) {

    db.collection("forms").findOne({ _id: new ObjectID(formid) })
      .then(doc => {

        var schema = doc.schemaname;
        db.collection(schema).findOne({ _id: new ObjectID(objectid) })
           .then(obj => {
            if (obj) {

              var prop = obj["property"];
              prop["personal-verified"] = false
              prop["document-verified"] = false
              prop["family-verified"] = false

              db.collection(schema)
                .findOneAndUpdate(
                  { _id: new ObjectID(objectid) },
                  { $set: { status: "active", stage: "NEW", disposition: disposition.property, property: prop } }
                )
                .then((obj1) => console.log(obj1));
            }
        })

      })

  });

}

// function callapi(disposition, posturl) {

//   var formid = disposition.formid;
//   var objectid = disposition.objectid;

//   MongoClient.connect(url, function (err, db) {

//     db.collection("forms").findOne({ _id: new ObjectID(formid) })
//       .then(doc => {

//         var schema = doc.schemaname;
//         db.collection(schema).findOne({ _id: new ObjectID(objectid) })
//            .then(obj => {

//             const querystring = require('querystring');
//             const https = require('https');
//             var url = require('url');
//             url = url.parse(posturl, true);

//             var postData = querystring.stringify({
//                 'ClientName' : obj.fullname,
//                 'Address' : obj.property.address,
//                 'AppointmentDateAndTime' : disposition.property.followupdate,
//                 'ClientContactNumber1' : obj.property.mobile_number,
//                 'ClientContactNumber2' : obj.property.mobile_number_2,
//                // 'TelecallerName' : user.fullname,
//                 'CarOwned' : obj.property.carowned,
//                 'MembershipOwned' : obj.property.membershipowned
//             });

//             //console.log("postData", postData);

//             var options = {
//               hostname: url.host,
//               port: 443,
//               path: url.pathname,
//               method: 'POST',
//               headers: {
//                   'Content-Type': 'application/x-www-form-urlencoded',
//                   'Content-Length': postData.length
//                 }
//             };

//             var req = https.request(options, (res) => {
//               console.log('statusCode:', res.statusCode);
//              // console.log('headers:', res.headers);

//               res.on('data', (d) => {
//               //  process.stdout.write(d);
//               });
//             });

//             req.on('error', (e) => {
//               console.error(e);
//             });

//             req.write(postData);
//             req.end();


//         })

//       })

//   });

// }