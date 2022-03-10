// const bcrypt = require('bcrypt');
const Joi = require('joi');
const Attendance = require('../models/attendance.model');
const Staffattendanceview = require('../views/staffattendance.view');
import async from "async";
import { ObjectId } from "mongodb";
const moment = require('moment');

const attendanceSchema = Joi.object({
  checkin: Joi.date().required(),
  checkout: Joi.date().required(),
  membrozid: Joi.string().hex().required(),
  property: Joi.object(),
  onModel: Joi.string().required(),
  status: Joi.string().allow(null)

})


module.exports = {
  insert,
  insertmultiple,
  deletemultiple,
  update,
  patch,
  remove,
  filter,
  filterview,
  findcount,
  findbyId,
  exportdata,
  logattendance,
  getnextsyncid
}

async function findbyId(Id) {
  return await Attendance.findById(Id);
}

async function insertmultiple(req) {
  var attarray = [];
  var attendances = req.body.attendances;
  attendances.forEach((attendance) => {
    var attendance = {
      membrozid: attendance.membrozid,
      onModel: attendance.onModel,
      checkin: attendance.checkin,
      checkout: attendance.checkout
    }
    Attendance(attendance).save(req)
    .then((attendance) =>{
      attendance.save(req);
      attarray.push(attendance)
    })
  }) 
  return attarray;
} 


async function deletemultiple(Id, req) {
  var attendances = req.body.attendances;
  attendances.forEach(async (att) => {
    var attendance = await Attendance.findById(att._id);
    attendance.status = "deleted"
    Attendance(attendance).save(req)
    .then((attendance) =>{
      attendance.save(req);
    })
  })
  return await attendances;
} 


async function insert(req) {
  
  if (req.body.property) {
    req.body.checkin = req.body.property.checkin ? req.body.property.checkin : req.body.checkin;
    req.body.checkout = req.body.property.checkout ? req.body.property.checkout : req.body.checkout;
  }
  // var branch = req.body.authkey.branchid;
  // var now = moment();
  // var clientOffset = req.headers.timezone; //now.tz(clienttimezone).utcOffset(); // your time zone, not necessarily the server's

  // if (clientOffset < 0) clientOffset = Math.abs(clientOffset);
  // else clientOffset = -Math.abs(clientOffset);
  // var localOffset = now.tz(branch.timezone).utcOffset();
  // var attendancedate = req.body.checkin ? req.body.checkin : req.body.attendancedate;
  // attendancedate = new Date(attendancedate)
  // attendancedate.setMinutes(attendancedate.getMinutes() + clientOffset)
  // var checkin = new Date(req.body.checkin);
  // var hrs = checkin.getHours();
  // var min = checkin.getMinutes();
  // min += hrs * 60;
  var checkin = new Date(req.body.checkin)
  var checkout = new Date(req.body.checkout)
  // checkin = new Date(attendancedate);
  // checkin.setUTCHours(0);
  // checkin.setUTCMinutes(min);
  // req.body.checkin = checkin;
  // if (!req.body.property) req.body.property = {}
  // req.body.property['checkin'] = checkin;


  // var checkout = new Date(req.body.checkout);
  // var hrs = checkout.getHours();
  // var min = checkout.getMinutes();
  // min += hrs * 60;
  // checkout = new Date(attendancedate);
  // checkout.setUTCHours(0);
  // checkout.setUTCMinutes(min);
  // req.body.checkout = checkout;
  // req.body.property['checkout'] = checkout;

  if (req.body.property && req.body.property['breaktime']){
    var diff = (checkout.getTime() - checkin.getTime()) / 60000;    
    req.body.property['totaltime'] = diff - req.body.property['breaktime'];
  }

  var attendance = {
    checkin: checkin,
    checkout: checkout,
    membrozid: req.body.membrozid ? req.body.membrozid : req.body.authkey._id.toString(),
    onModel: req.body.onModel ? req.body.onModel : "User",
    property: req.body.property
  }
  attendance = await Joi.validate(attendance, attendanceSchema, { abortEarly: false });
  return await new Attendance(attendance).save(req);
}

async function update(Id, req) {
  //console.log("UPDATE")
  var attendance = await Attendance.findById(Id);
  attendance._original = attendance.toObject();
  
  if (req.body.property) {
    req.body.checkin = req.body.property.checkin ? req.body.property.checkin : req.body.checkin;
    req.body.checkout = req.body.property.checkout ? req.body.property.checkout : req.body.checkout;
  }
  
  // var branch = req.body.authkey.branchid;
  // var now = moment();
  // var clientOffset = req.headers.timezone; //now.tz(clienttimezone).utcOffset(); // your time zone, not necessarily the server's

  // if (clientOffset < 0) clientOffset = Math.abs(clientOffset);
  // else clientOffset = -Math.abs(clientOffset);
  // var localOffset = now.tz(branch.timezone).utcOffset();
  // var attendancedate = req.body.checkin ? req.body.checkin : req.body.attendancedate;
  // attendancedate = new Date(attendancedate)
  // attendancedate.setMinutes(attendancedate.getMinutes() + clientOffset)
  // var checkin = new Date(req.body.checkin);
  // var hrs = checkin.getHours();
  // var min = checkin.getMinutes();
  // var checkinday = checkin.getDate();
  // min += hrs * 60;

  // checkin = new Date(attendancedate);
  // checkin.setUTCHours(0);
  // checkin.setUTCMinutes(min);
  // req.body.checkin = checkin;
  // if (!req.body.property) req.body.property = {}
  // req.body.property['checkin'] = checkin;


  // var checkout = new Date(req.body.checkout);
  // var hrs = checkout.getHours();
  // var min = checkout.getMinutes();
  // var checkoutday = checkout.getDate();
  // min += hrs * 60;
  // checkout = new Date(attendancedate);
  // checkout.setUTCHours(0);
  // checkout.setUTCMinutes(min);
  // if (checkinday > checkoutday) {
  //   checkout.setDate(checkout.getDate() + 1)
  // }
  // req.body.checkout = checkout;
  // req.body.property['checkout'] = checkout;
  var checkin = new Date(req.body.checkin)
  var checkout = new Date(req.body.checkout)

  if (req.body.property && req.body.property['breaktime']){
    var diff = (checkout.getTime() - checkin.getTime()) / 60000;    
    req.body.property['totaltime'] = diff - req.body.property['breaktime'];
  }

  attendance.checkin = checkin;
  attendance.checkout = checkout
  attendance.property = req.body.property
  //console.log(attendance)
  return await attendance.save(req);
}

async function patch(Id, req) {
  //console.log("PATCH")
  var attendance = await Attendance.findById(Id);
  attendance._original = attendance.toObject();
  if (req.body.property) {
    req.body.checkin = req.body.property.checkin ? req.body.property.checkin : req.body.checkin;
    req.body.checkout = req.body.property.checkout ? req.body.property.checkout : req.body.checkout;
  }

  var branch = req.body.authkey.branchid;
  var now = moment();
  var clientOffset = req.headers.timezone; //now.tz(clienttimezone).utcOffset(); // your time zone, not necessarily the server's

  if (clientOffset < 0) clientOffset = Math.abs(clientOffset);
  else clientOffset = -Math.abs(clientOffset);
  var localOffset = now.tz(branch.timezone).utcOffset();
  var attendancedate = req.body.checkin ? req.body.checkin : req.body.attendancedate;
  attendancedate = new Date(attendancedate)
  attendancedate.setMinutes(attendancedate.getMinutes() + clientOffset)
  var checkin = new Date(req.body.checkin);
  var hrs = checkin.getHours();
  var min = checkin.getMinutes();  
  var checkinday = checkin.getDate();
  min += hrs * 60;

  checkin = new Date(attendancedate);
  checkin.setUTCHours(0);
  checkin.setUTCMinutes(min);
  req.body.checkin = checkin;
  if (!req.body.property) req.body.property = {}
  req.body.property['checkin'] = checkin;


  var checkout = new Date(req.body.checkout);
  var hrs = checkout.getHours();
  var min = checkout.getMinutes();  
  var checkoutday = checkout.getDate();
  min += hrs * 60;
  checkout = new Date(attendancedate);
  checkout.setUTCHours(0);
  checkout.setUTCMinutes(min);
  if (checkinday > checkoutday) {
    checkout.setDate(checkout.getDate() + 1)
  }
  req.body.checkout = checkout;
  req.body.property['checkout'] = checkout;

  if (req.body.property && req.body.property['breaktime']) {
    var diff = (req.body.checkout.getTime() - req.body.checkin.getTime()) / 60000;
    req.body.property['totaltime'] = diff - req.body.property['breaktime'];
  }

  if (req.body.property) attendance.property = req.body.property;
  if (req.body.checkin) attendance.checkin = req.body.checkin;
  if (req.body.checkout) attendance.checkout = req.body.checkout;
  if (req.body.status) attendance.status = req.body.status;
  return await attendance.save(req);
}

async function remove(Id, req) {
  var attendance = await Attendance.findById(Id);
  attendance.status = "deleted"
  return await attendance.save(req);
}

async function filter(params) {
  return await Attendance.getbyfilter(params)
}

async function filterview(params) {
  return await Staffattendanceview.filterview(params)
}

async function findcount(req) {
  return await Attendance.findcount(req)
}

async function exportdata(params) {
  return await Attendance.exportdata(params)
}

async function logattendance(req, res, next) {

  var data = req.body.data;
  if (data && data.length > 0) {

    async.forEachSeries(data, (att, next) => {

      var logtime = new Date(att.logtime)
      var day = logtime.getDate();
      var month = logtime.getMonth() + 1;
      var year = logtime.getFullYear();
      var agg = [
        {
          $lookup: {
              "from" : "branches",
              "localField" : "branchid",
              "foreignField" : "_id",
              "as" : "branch"
          }
        },
        {
          $unwind: {
              path : "$branch"
          }
        },
        {
          $addFields: {
              "logdate": {
                $dateToParts: {
                  'date' : "$checkin",
                  'timezone' : "$branch.timezone"
              }
              }
          
          }
        },
        {
          $match: {
            "logdate.day": day,
            "logdate.month": month,
            "logdate.year": year,
            "membrozid": ObjectId(att.membrozid)
          }
        },
      ];
      Attendance.aggregate(agg)       
        .then((attendances) => {

          var attendance = attendances && attendances.length > 0 ? attendances[0] : null;

          if (attendance) {
            var checkin, checkout;
            if (attendance.checkout > logtime) {
              checkin = logtime;
              checkout = attendance.checkout;
            }
            else {
              checkout = logtime;
              checkin = attendance.checkin;
            }
            Attendance.findOneAndUpdate({ _id: attendance._id }, { "$set": { checkout: checkout, checkin: checkin } }).then(()=> next())
              
          }
          else {

            const attendance = new Attendance({
              checkin: new Date(att.logtime),
              checkout: new Date(att.logtime),
              membrozid: att.membrozid,
              property: att.property,
              onModel: att.onModel
            });

            attendance.save(req).then(()=> next())

          }
        })

    })

    return res.json({})

  }
  else {
    var logtime = req.body.logtime;
    var onModel = req.body.onModel
    if (!onModel) onModel = "User"

    if (logtime) {
      const attendance = new Attendance({
        checkin: new Date(logtime),
        checkout: new Date(logtime),
        membrozid: req.body.membrozid,
        onModel: req.body.onModel
      });
      attendance.save()
        .then(savedAttendance => { return res.json(savedAttendance) })
        

    }
  }
}

async function getnextsyncid(req, res, next) {

  var branchid = req.body.authkey.branchid._id;

  Attendance.findOne({ "property": { "$exists": true }, branchid: branchid})
            .sort({ "property.syncid": -1 })
            .then((att) => {
              var synid = 0
              if (att) synid = att.property.syncid;
              res.json({ "syncid": synid })
            });

}
