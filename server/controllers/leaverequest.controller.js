// const bcrypt = require('bcrypt');
const Joi = require('joi');
const Leaverequest = require('../models/leaverequest.model');
const moment = require('moment');

const leaverequestSchema = Joi.object({
  userid: Joi.string().hex().required(),
  leavetype: Joi.string().hex().required(),
  noofleave: Joi.number(),
  property: Joi.object()
})


module.exports = {
  insert,
  update,
  remove,
  filter,
  findcount,
  findbyId,
  exportdata
}

async function findbyId(Id) {
  return await Leaverequest.findById(Id);
}

function getNumberOfWeekDays(start, end, dayNum){
  // Sunday's num is 0 with Date.prototype.getDay.
  var days = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6
  }
  dayNum = days[dayNum]
  //console.log("dayNum", dayNum)
  // Calculate the number of days between start and end.
  var daysInInterval = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
  //console.log("daysInInterval", daysInInterval)
  // Calculate the nb of days before the next target day (e.g. next Sunday after start).
  var toNextTargetDay = (7 + dayNum - start.getDay()) % 7;
  // Calculate the number of days from the first target day to the end.
  //console.log("toNextTargetDay", toNextTargetDay)
  var daysFromFirstTargetDay = Math.max(daysInInterval - toNextTargetDay, 0);
  // Calculate the number of weeks (even partial) from the first target day to the end.
  return Math.ceil(daysFromFirstTargetDay / 7);
}

async function insert(req) {

  var branch = req.body.authkey.branchid;
  var workingdays = branch.workinghours.days;
  var days = [ 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', "Saturday", "Sunday" ]
  let difference = days.filter(x => !workingdays.includes(x))
  var fromdate = new Date(req.body.property.fromdate);
  var todate = new Date(req.body.property.todate);
  var now = moment();
  var clientOffset = req.headers.timezone; //now.tz(clienttimezone).utcOffset(); // your time zone, not necessarily the server's

  if (clientOffset < 0) clientOffset = Math.abs(clientOffset);
  else clientOffset = -Math.abs(clientOffset);

  var localOffset = now.tz(branch.timezone).utcOffset();
  todate.setMinutes(todate.getMinutes() + clientOffset- localOffset)
  todate.setDate(todate.getDate() + 1)
  //todate.setUTCMinutes(localOffset);
  fromdate.setMinutes(fromdate.getMinutes() + clientOffset - localOffset)
  //fromdate.setUTCMinutes(localOffset);
  //todate.setDate(todate.getDate() + 1)
  //console.log(todate, fromdate)
  var noofweekends = 0;
  difference.forEach((day)=>{
    noofweekends += getNumberOfWeekDays(fromdate, todate, day);
    //console.log("noofweekends", noofweekends, day)
  })

  // One day in milliseconds
  const oneDay = 1000 * 60 * 60 * 24;
  // Calculating the time difference between two dates
  const diffInTime = todate.getTime() - fromdate.getTime();
  // Calculating the no. of days between two dates
  var noofdays = Math.round(diffInTime / oneDay);
  noofdays -= noofweekends;

  var leaverequest = {
    userid: req.body.userid ? req.body.userid.toString() : req.body.authkey._id.toString(),
    leavetype: req.body.leavetype,
    noofleave: noofdays,
    property: req.body.property
  }
  leaverequest = await Joi.validate(leaverequest, leaverequestSchema, { abortEarly: false });
  return await new Leaverequest(leaverequest).save(req);
}

async function update(Id, req) {
  var leaverequest = await Leaverequest.findById(Id);
  leaverequest._original = leaverequest.toObject();
  leaverequest.userid = req.body.userid,
  leaverequest.leavetype = req.body.leavetype,
  leaverequest.property = req.body.property
  return await leaverequest.save(req);
}

async function remove(Id, req) {
  var leaverequest = await Leaverequest.findById(Id);
  leaverequest.status = "deleted"
  return await leaverequest.save(req);
}

async function filter(params) {
  return await Leaverequest.getbyfilter(params)
}

async function findcount(req) {
  return await Leaverequest.findcount(req)
}

async function exportdata(params) {
  return await Leaverequest.exportdata(params)
}
