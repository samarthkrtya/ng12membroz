// const bcrypt = require('bcrypt');
const Joi = require('joi');
const Seasoncalendar = require('../models/seasoncalendar.model');
import moment from 'moment';

const designationSchema = Joi.object({
  location: Joi.string().hex().required(),
  season: Joi.string().required(),
  startperiod: Joi.date().required(),
  endperiod: Joi.date().required(),
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
  clearseasonweeks,
  getseasonweeks
}

function clearseasonweeks(req, res, next) {

  var year = req.params.year;
  var newdate = new Date();
  newdate.setFullYear(year);
  var fromdate = new Date(moment(newdate).startOf('year'));
  var todate = new Date(fromdate);

  todate = moment(todate).add(364, "day");

  Seasoncalendar.remove({
    "$and": [
      {
        "startperiod": {
          "$gte": fromdate
        }
      },
      {
        "startperiod": {
          "$lte": todate
        }
      }
    ],
  })
    .then(dates => res.json({}))
    .catch(e => next(e));

}

function getseasonweeks(req, res, next) {
  var year = req.params.year;
  var newdate = new Date();
  var weekstart = global.CALENDARWEEK;
  newdate.setFullYear(year);
  var startofday = new Date(moment(newdate).startOf('year')).getDay();
  var yearweeks = [];
  if (weekstart > startofday) {
    var startweek = weekstart - startofday + 1;
    var firstweek = new Date(moment(newdate).startOf('year'));

    firstweek.setDate(startweek + 1);
  }
  else if (weekstart < startofday) {
    var startweek = startofday - weekstart;
    var firstweek = new Date(moment(newdate).startOf('year'));

    firstweek.setDate(startweek + 1);
  }
  else if (weekstart === startofday) {
    var startweek = 1;
    var firstweek = new Date(moment(newdate).startOf('year'));

    firstweek.setDate(startweek + 1);
  }
  yearweeks.push(firstweek);
  for (var i = 0; i < 51; i++) {
    firstweek = moment(firstweek).add(1, 'week').toDate();
    yearweeks.push(firstweek);
  }
  //console.log(yearweeks);

  res.json(yearweeks);
}
async function findbyId(Id) {
  return await Seasoncalendar.findById(Id);
}

async function insert(req) {
  var seasoncalendar = {
    location: req.body.location,
    season: req.body.season,
    startperiod: req.body.startperiod,
    endperiod: req.body.endperiod,
    property: req.body.property
  }
  seasoncalendar = await Joi.validate(seasoncalendar, designationSchema, { abortEarly: false });
  return await new Seasoncalendar(seasoncalendar).save(req);
}

async function update(Id, req) {
  var seasoncalendar = await Seasoncalendar.findById(Id);
  seasoncalendar._original = seasoncalendar.toObject();
  seasoncalendar.location = req.body.location,
    seasoncalendar.season = req.body.season,
    seasoncalendar.startperiod = req.body.startperiod,
    seasoncalendar.endperiod = req.body.endperiod,
    seasoncalendar.property = req.body.property
  return await seasoncalendar.save(req);
}

async function remove(Id, req) {
  var seasoncalendar = await Seasoncalendar.findById(Id);
  seasoncalendar.status = "deleted"
  return await seasoncalendar.save(req);
}

async function filter(params) {
  return await Seasoncalendar.getbyfilter(params)
}

async function findcount(req) {
  return await Seasoncalendar.findcount(req)
}

async function exportdata(params) {
  return await Seasoncalendar.exportdata(params)
}
