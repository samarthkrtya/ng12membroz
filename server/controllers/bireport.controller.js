// const bcrypt = require('bcrypt');
const Joi = require('joi');
const BIreport = require('../models/bireport.model');
const createHTML = require('../helpers/createHTML');
var MongoClient = require('mongodb').MongoClient;
var url = process.env.MONGO_HOST;
var ObjectID = require('mongodb').ObjectID;
import Analyticsreport from '../models/analyticsreport.model';
import common from '../helpers/common';

const reportSchema = Joi.object({
  title: Joi.string().required(),
  selectfields : Joi.array(),
  filterfields : Joi.array(),
  property: Joi.object()
})


module.exports = {
  insert,
  update,
  patch,
  remove,
  filter,
  reportview,
  chartreport,
  findcount,
  findbyId,
  getDynamicFields,
  exportdata
}

async function findbyId(Id) {
  return await BIreport.findById(Id);
}

async function insert(req) {
  var bireport = {
    title: req.body.title,
    property: req.body.property
  }
  bireport = await Joi.validate(bireport, reportSchema, { abortEarly: false });
  return await new BIreport(bireport).save(req);
}

async function update(Id, req) {
  var bireport = await BIreport.findById(Id);
  bireport._original = bireport.toObject();
  bireport.title = req.body.title,
  bireport.property = req.body.property
  return await bireport.save(req);
}

async function patch(Id, req) {
  var bireport = await BIreport.findById(Id);
  bireport._original = bireport.toObject();
  if (req.body.selectfields) bireport.selectfields = req.body.selectfields;
  if (req.body.filterfields) bireport.filterfields = req.body.filterfields;
  if (req.body.sortfields) bireport.sortfields = req.body.sortfields;
  return await bireport.save(req);
}

async function remove(Id, req) {
  var bireport = await BIreport.findById(Id);
  bireport.status = "deleted"
  return await bireport.save(req);
}

async function filter(params) {
  var permission = params.authkey.role.bireportpermissions;
  var search = []
  if (permission && permission.length > 0) {
    var searchobj = {
      searchfield: "_id",
      searchvalue: permission,
      datatype: "ObjectId",
      criteria: "in"
    }
    search.push(searchobj)
    params.search = search;
    return await BIreport.getbyfilter(params)
  }
  else {
    return []
  }

}

async function findcount(req) {
  return await BIreport.findcount(req)
}

async function exportdata(params) {
  return await BIreport.exportdata(params)
}

async function getDynamicFields(req) {
 
  var analyticfields = req.body.analyticfields;
  

   var aggr = analyticfields.aggregates[0];

  var client = await MongoClient.connect(url);
  var db = client.db();
  var schemaname = aggr.schemaname;
  var matches = [];
  var aggregate = aggr.aggregate;

  

  matches.push({ searchfield: "branchid", searchvalue: req.body.authkey.branchid._id, datatype: "ObjectId", criteria: "eq" })
  matches.push({ searchfield: "userid", searchvalue: req.body.authkey._id, datatype: "ObjectId", criteria: "eq" })

  aggregate = common.getmatches(aggregate, matches, req.body.authkey);

  
  // console.log("aggregate",JSON.stringify(aggregate));
  var result = await db.collection(schemaname).aggregate(aggregate).toArray();
  // console.log("result",result)
  if (client) client.close();

  var fields = [];
  if(req.body.report.selectfields.length > 0){
    req.body.report.selectfields.forEach(field => {
      if (field.isDisplayOnList) {
        fields.push(field)
      }
    }); 
  }
  
  if(result && result[0].selectedfields){
    result[0].selectedfields.forEach(field => {
      if (field.isDisplayOnList) {
        fields.push(field)
      }
    }); 
  }
   
req.body.report.selectfields = fields;
   return ;
}



async function reportview(req, res) {
  
  var matchesvalue = req.body.search ? req.body.search : [];
  var analytic = req.body.analyticreport;
  var branch = req.body.authkey.branchid;


  // console.log("matchesvalue", matchesvalue)

  // if (matchesvalue && matchesvalue.length == 0) return { content: '' }
  var aggr = analytic.aggregates[0];

  var client = await MongoClient.connect(url);
  var db = client.db();
  var schemaname = aggr.schemaname;
  var matches = [];
  var aggregate = aggr.aggregate;

  // console.log("aggregate studio", JSON.stringify(aggregate))
  matchesvalue.forEach(function (match) {

    var datatype = match.datatype;
    var value = match.searchvalue;
    var newvalue = [];
    if (Array.isArray(value)) {
      value.forEach((val)=>{
        newvalue.push(ObjectID(val));
      })
      match.datatype = "ObjectId"
      match.searchvalue = newvalue
    }
    else if (datatype.toLowerCase() == "date"){
      var newvalue = {};
      for (const prop in value) {
        newvalue[prop] = new Date(value[prop])
      }
      match.searchvalue = newvalue
    }
    matches.push(match);
  });

  matches.push({ searchfield: "branchid", searchvalue: req.body.authkey.branchid._id, datatype: "ObjectId", criteria: "eq" })
  matches.push({ searchfield: "userid", searchvalue: req.body.authkey._id, datatype: "ObjectId", criteria: "eq" })

  aggregate = common.getmatches(aggregate, matches, req.body.authkey);

  // console.log("aggregate editor", JSON.stringify(aggregate))
  var result = await db.collection(schemaname).aggregate(aggregate).toArray();
  if (client) client.close();
  
  var fields = [];
  if(req.body.report.selectfields.length > 0){
    req.body.report.selectfields.forEach(field => {
      if (field.isDisplayOnList) {
        fields.push(field)
      }
    });
  }

  
  if (req.body.export) {
    req.body.select = fields;
    return result;
  }
  
  // else return { content: createHTML.getreporthtml(req.body.report, fields, result, branch) }
  else return { content: createHTML.getreporthtml(req.body.report, fields, result, branch) , data : result }


}

async function chartreport(req, res) {

  var matchesvalue = req.body.search ? req.body.search : [];
  var analytic = req.body.analyticreport;

  if (matchesvalue && matchesvalue.length == 0) return { content: '' }
  var aggr = analytic.aggregates[0];

  var client = await MongoClient.connect(url);
  var db = client.db();
  var schemaname = aggr.schemaname;
  var matches = [];
  var aggregate = aggr.aggregate;

  matchesvalue.forEach(function (match) {

    var datatype = match.datatype;
    var value = match.searchvalue;
    var newvalue = [];
    if (Array.isArray(value)) {
      value.forEach((val)=>{
        newvalue.push(ObjectID(val));
      })
      match.datatype = "ObjectId"
      match.searchvalue = newvalue
    }
    else if (datatype.toLowerCase() == "date"){
      var newvalue = {};
      for (const prop in value) {
        newvalue[prop] = new Date(value[prop])
      }
      match.searchvalue = newvalue
    }
    matches.push(match);
  });

  matches.push({ searchfield: "branchid", searchvalue: req.body.authkey.branchid._id, datatype: "ObjectId", criteria: "eq" })
  matches.push({ searchfield: "userid", searchvalue: req.body.authkey._id, datatype: "ObjectId", criteria: "eq" })

  aggregate = common.getmatches(aggregate, matches, req.body.authkey);

  var result = await db.collection(schemaname).aggregate(aggregate).toArray();
  if (client) client.close();

  // var fields = [];
  // req.body.report.selectfields.forEach(field => {

  //   if (field.isDisplayOnList) {
  //     fields.push(field)
  //   }

  // });

  return result
  //return { content: createHTML.getreporthtml(req.body.report, fields, result) }


}


