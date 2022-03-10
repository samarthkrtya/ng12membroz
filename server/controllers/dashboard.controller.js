const Dashboard = require('../models/dashboard.model');
const Webpart = require('../models/webpart.model');
const common = require('../helpers/common');
var url = process.env.MONGO_HOST;
var ObjectID = require('mongodb').ObjectID;
var MongoClient = require('mongodb').MongoClient;
import sync from "async";
const Joi = require('joi');

const DashboardSchema = Joi.object({
  title: Joi.string().required(),
  property: Joi.object()
})

module.exports = {
  insert,
  update,
  remove,
  filter,
  findbyId,
  patch,
  getwebparts,
  webpartfilter,
  findcount,
  exportdata,
  getwebpartdata
}

async function insert(req) {
  var dashboard = {
    title: req.body.title,
    property: req.body.property
  }

  await Joi.validate(dashboard, DashboardSchema, { abortEarly: false });
  return await new Dashboard(dashboard).save(req);
}

async function update(Id, req) {
  var dashboard = await Dashboard.findById(Id);
  dashboard._original = dashboard.toObject();
  dashboard.title = req.body.title,
  dashboard.property = req.body.property
  return await dashboard.save(req);
}

async function remove(Id, req) {
  var dashboard = await Dashboard.findById(Id);
  dashboard.status = "deleted"
  return await dashboard.save(req);
}

async function findbyId(Id, req) {
  var data = await Dashboard.findById(Id);
  return data;
}

async function patch(Id, req) {
  var dashboard = await Dashboard.findById(Id);
  if (req.body.rows) dashboard.rows = req.body.rows;
  if (req.body.title) dashboard.title = req.body.title;
  return await dashboard.save(req);
}

async function webpartfilter(req) {

  var webpartid = ObjectID(req.body.webpartid);
  var matches = req.body.matches;
  var authkey = req.body.authkey;
  if (!matches) matches = [];
  matches.push({ searchfield: "branchid", searchvalue: req.body.authkey.branchid._id, datatype: "ObjectId", criteria: "eq" })
  matches.push({ searchfield: "userid", searchvalue: req.body.authkey._id, datatype: "ObjectId", criteria: "eq" })

  var webpart = await Webpart.findById(webpartid)
  var schemaname = webpart.schemaname;
  var searchid = webpart.searchid;
  var aggregate = common.getmatches(searchid, matches, authkey);

  var client = await MongoClient.connect(url);
  var db = client.db();

  var docs = await db.collection(schemaname).aggregate(aggregate).toArray();
  //console.log("aggregate", JSON.stringify(aggregate))
  //console.log("ids", docs)
  if (docs && docs.length > 0) {
    
    return docs[0].ids;
  }
  else {
    return [];
  }

}

function getwebpartdata(req, res, next) {

  var matches = req.body.matches ? req.body.matches : [];
  var webpartid = req.body.webpartid;
  matches.push({ searchfield: "branchid", searchvalue: req.body.authkey.branchid._id, datatype: "ObjectId", criteria: "eq" })
  matches.push({ searchfield: "userid", searchvalue: req.body.authkey._id, datatype: "ObjectId", criteria: "eq" })
  Webpart.findById(webpartid).then((agg) => {

    var schemaname = agg.schemaname;
    var aggregate = agg.filter.stages;
    var authkey = req.body.authkey;
    
    aggregate = common.getmatches(aggregate, matches, authkey);
    MongoClient.connect(url, function (err, client) {

      var db = client.db();

      if (db) {
        db.collection(schemaname).aggregate(aggregate)
          .toArray(function (err, docs) {
            var item = {
              webpartid: agg._id,
              type: agg.webparttype,
              data: docs,
            };
            res.json(item)
          })
      }

    })

  })

}

function getwebparts(req, res, next2) {

  var dashboard = [];
  var data = req.body.data;
  var matches = req.body.matches?req.body.matches:[];
  matches.push({ searchfield: "branchid", searchvalue: req.body.authkey.branchid._id, datatype: "ObjectId", criteria: "eq"  })
  matches.push({ searchfield: "userid", searchvalue: req.body.authkey._id, datatype: "ObjectId", criteria: "eq" })

  MongoClient.connect(url, function (err, client) {

   var db = client.db();

   sync.forEachSeries(data.rows, (row, next) =>{

    var webparts = row.webparts;
    var authkey = req.body.authkey;

    sync.forEachSeries(webparts, (webpart, next1) =>{

      Webpart.findById(webpart).then((agg)=>{

          var schemaname  = agg.schemaname;
          var aggregate  = agg.filter.stages;
          var aggmatches  = agg.filter.matches;
          
          if (aggmatches && aggmatches.length>0){
          aggmatches.forEach((e)=>{
            if(e.default == 'CURRENTMONTH'){
              e.searchvalue = new Date().getMonth()+1;
            }else if(e.default == 'CURRENTYEAR'){
              e.searchvalue = new Date().getFullYear()
            }
            matches.push({ searchfield: e.searchfield, searchvalue: e.searchvalue, datatype: e.datatype, criteria: e.criteria  });
          })
        }

          aggregate = common.getmatches(aggregate, matches, authkey);
          // console.log("aggregate", JSON.stringify(aggregate))
          if(db) {
            db.collection(schemaname).aggregate(aggregate)
              .toArray(function(err, docs) {
                // console.log(JSON.stringify(aggregate))
                // console.log(webpart.category)
                // console.log(JSON.stringify(docs))
                var item = {
                  webpartid: webpart._id,
                  type: agg.webparttype,
                  data: docs,
                };
                dashboard.push(item);
                next1();
              })
          }

        })

      }, function(){
        next();
      })



    }, function(){
      if(client) client.close();
      res.json(dashboard)
    })

  })

}

async function filter(req) {
  return await Dashboard.getbyfilter(req)
}

async function findcount(params) {
  return await Dashboard.findcount(params)
}

async function exportdata(params) {
  return await Dashboard.exportdata(params)
}
