import Analyticsreport from '../models/analyticsreport.model';
import Accounthead from '../models/accounthead.model';
import async from "async";
import common from '../helpers/common';
const moment = require('moment');
var url = process.env.MONGO_HOST;
var MongoClient = require('mongodb').MongoClient;


module.exports =  {
   generateanalyticsreport,
   checkconditions,
   filter,
   getaccounttxnsummary,
   getnetprofitloss,
   pulldata,
   findbyId,
   findcount,
   exportdata
};

async function findbyId(Id) {
  return await Analyticsreport.findById(Id);
}

async function getnetprofitloss(req, res, next) {

  var matchesvalue = req.body.search;
  Accounthead.find({ reporttype: "incomestatement" })
             .select({ "_id": 1 })
             .then((heads) => {
                var accountheads = [];
                heads.forEach(function(e){
                  accountheads.push(e._id)
                })

                var results = [];
                var netprofitloss = 0;
              Analyticsreport.findById("5d651363bb707bb4879f168b")
                              .then((analytic) => {

                                if(analytic){
                                  var aggregates = analytic.aggregates;

                                var reporttype = analytic.reporttype;
                                var first = true;

                              MongoClient.connect(url, function (err, client) {

                                  var db = client.db();
                                  async.forEachSeries(aggregates, (aggr, next) => {

                                      var aggregate = aggr.aggregate;
                                      var schemaname = aggr.schemaname;
                                      var matchingfields = aggr.matchingfields;
                                      var matches = aggr.matches;

                                      var branch = matches.find((e)=> {
                                        if (e.searchfield=="branchid") return e;
                                      })

                                      if (!branch) {
                                        matches.push({ searchfield: "branchid", searchvalue: req.body.authkey.branchid._id, datatype: "ObjectId", criteria: "eq"  })
                                      }
                                      else branch.searchvalue = req.body.authkey.branchid._id;

                                      if (matches && matchesvalue) {

                                        matchesvalue.forEach(function (value) {
                                          var fieldname = value.searchfield;
                                          var match = matches.find(function (el) {
                                            return el.searchfield == fieldname
                                          });
                                          if (match) {
                                            match.searchvalue = value.searchvalue;
                                          }
                                        })

                                        aggregate = common.getmatches(aggregate, matches, req.body.authkey);
                                      }

                                      var newaggregate = replacevalue(aggregate, "accountheads", accountheads)
                                      db.collection(schemaname).aggregate(newaggregate)
                                        .toArray(function (err, docs) {

                                          if (first) {
                                            docs.forEach(element => {
                                              results.push(element);
                                            });
                                          }
                                          else if (!first && !reporttype) {

                                            docs.forEach(element => {

                                              results.forEach(el => {

                                                  matchingfields.forEach(function (matchingfield) {

                                                        if (element[matchingfield] && el[matchingfield] && element[matchingfield].toString() == el[matchingfield].toString() )
                                                        {
                                                          // //console.log("element 0", element);
                                                          // //console.log("matchingfield", matchingfield);
                                                          // //console.log("el", el);
                                                          if (matchingfield=="draccount"){
                                                            if (!el.dramount) el.dramount = 0
                                                            el.dramount += element.dramount;
                                                            ////console.log("el.dramount", el.dramount);
                                                          }
                                                          else{
                                                            if (!el.cramount) el.cramount = 0
                                                            el.cramount += element.cramount;
                                                            ////console.log("el.cramount", el.cramount);
                                                          }

                                                        }

                                                      });

                                                  });

                                                  ////console.log("element", element);
                                                  if (element.accounttype == "Income" ||  element.accounttype == "Other Income" ) {
                                                    if (element.dramount > 0)
                                                      netprofitloss += Math.abs(element.dramount);
                                                    else if (element.cramount > 0)
                                                      netprofitloss -= Math.abs(element.cramount);
                                                  }
                                                  else {
                                                    if (element.cramount > 0)
                                                      netprofitloss += Math.abs(element.cramount);
                                                    else if (element.dramount > 0)
                                                      netprofitloss -= Math.abs(element.dramount);
                                                  }


                                              });

                                          }

                                          first = false;
                                          next();
                                        });


                                    }, function(){
                                      if (client) client.close();
                                      //console.log("netprofitloss", netprofitloss);
                                      // NET PROFIT & LOSS
                                      var data = req.body.data;
                                      var earnings = data.find(function(el){
                                          return el.headname == "Retained Earnings"
                                      })
                                      if (earnings){
                                        earnings.amount -= netprofitloss;
                                      }
                                      // //console.log("earnings", earnings);
                                      // //console.log("data", data);
                                      res.json(data);
                                    })
                                });
                                }
                            });


                          });


}

async function getaccounttxnsummary(req, res, next) {

  var matchesvalue = req.body.search;
  var accountheads = req.body.heads;
  var results = [];

  Analyticsreport.findById("5d651363bb707bb4879f168b")
                  .then((analytic) => {

                    if(analytic){
                      var aggregates = analytic.aggregates;

                    var reporttype = analytic.reporttype;
                    var first = true;

                  MongoClient.connect(url, function (err, client) {

                    var db = client.db();
                      async.forEachSeries(aggregates, (aggr, next) => {

                          var aggregate = aggr.aggregate;
                          var schemaname = aggr.schemaname;
                          var matchingfields = aggr.matchingfields;
                          var matches = aggr.matches;

                          var branch = matches.find((e)=> {
                            if (e.searchfield=="branchid") return e;
                          })

                          if (!branch) {
                            matches.push({ searchfield: "branchid", searchvalue: req.body.authkey.branchid._id, datatype: "ObjectId", criteria: "eq"  })
                          }
                          else branch.searchvalue = req.body.authkey.branchid._id;


                          if (matches && matchesvalue) {

                              matchesvalue.forEach(function (value) {
                                var fieldname = value.searchfield;
                                var match = matches.find(function (el) {
                                  return el.searchfield == fieldname
                                });
                                if (match) {
                                  match.searchvalue = value.searchvalue;
                                }
                              })

                              var newaggregate = replacevalue(aggregate, "accountheads", accountheads)
                              aggregate = common.getmatches(aggregate, matches,req.body.authkey);
                          }

                          db.collection(schemaname).aggregate(newaggregate)
                            .toArray(function (err, docs) {

                              if (first) {
                                docs.forEach(element => {
                                  results.push(element);
                                });
                              }
                              else if (!first && !reporttype) {

                                docs.forEach(element => {

                                  results.forEach(el => {

                                      matchingfields.forEach(function (matchingfield) {

                                            if (element[matchingfield] && el[matchingfield] && element[matchingfield].toString() == el[matchingfield].toString() )
                                            {
                                              if (matchingfield=="draccount"){
                                                el["amount"] += element.dramount;
                                              }
                                              else{
                                                el["amount"] -= element.cramount;
                                              }
                                            }

                                          });

                                      });


                                  });


                              }

                              first = false;
                              next();
                            });


                        }, function(){
                          if (client) client.close();
                          if (req.params.reporttype != "incomestatement"){
                            req.body.data = results;
                            next();
                          }
                          else {
                            return res.json(results)
                          }
                        })
                    });
                    }
                });
}

function replacevalue(aggregate, fieldname, fieldvalue)
{

  for (let key in aggregate) {

    if (aggregate[key] instanceof Object && aggregate[key].constructor === Object)
    {
        replacevalue(aggregate[key], fieldname, fieldvalue)
    }
    else if (Array.isArray(aggregate[key]))
    {
        ////console.log("value", value)
        var newarray = [];
        aggregate[key].forEach(function(e){

          ////console.log("e", e)
          if (e instanceof Object && e.constructor === Object)
          {
              replacevalue(aggregate[key], fieldname, fieldvalue)
          }
          else if (Array.isArray(e))
          {

          }
          else {
            if (fieldname == e){
              newarray.push(fieldvalue);
              ////console.log("aggregate", aggregate);
            }
            else {
              newarray.push(e);
            }
          }

        })
        aggregate[key] = newarray;
    }
    else {

      if (fieldname == aggregate[key]){
        aggregate[key] = fieldvalue;
      }

    }
  }

  return  aggregate;

}

async function filter(req) {
  return await Analyticsreport.getbyfilter(req)
}

// async function filter(req, res, next) {
//   var search = req.body;
//   Analyticsreport.getbyfilter(search)
//     .then((analyticsreports) => {
//       next(analyticsreports);// next();
//     })
//     .catch(e => next(e));
// }

function checkconditions(req, res, next) {

  var conditions = req.body.conditions;
  var matchesvalue = req.body.matches;

  Analyticsreport.find({_id: {"$in": conditions}})
    .then((analytics) => {
      var result = {};

      MongoClient.connect(url, function (err, client) {

        var db = client.db();
        async.forEachSeries(analytics, (analytic, next) => {

          var aggr = analytic.aggregates[0];
          var schemaname = aggr.schemaname;
          var matches = aggr.matches;
          var message = analytic.message;
          var aggregate = aggr.aggregate;

          if (matches) {
            if (matchesvalue) {
              matchesvalue.forEach(function (value) {
                var fieldname = value.searchfield;
                var match = matches.find(function (el) {
                  return el.searchfield == fieldname
                });
                if (match) {
                  match.searchvalue = value.searchvalue;
                }
              })
            }
            aggregate = common.getmatches(aggregate, matches, req.body.authkey);
          }

          if (db) {
            db.collection(schemaname).aggregate(aggregate)
              .toArray(function (err, docs) {
                if (docs && docs.length > 0) {
                  result = {condition: true};
                }
                else {
                  result = {
                    condition: false,
                    messages: message
                  }
                }
                next();
              })
          }

        }, function () {
          if (client) client.close();
          res.json(result);
        })

      })

    })

}


function pulldata(req, res, next) {

  var pullid = req.body.pullid;
  var matchesvalue = req.body.matches;

  Analyticsreport.findById(pullid)
    .then((analyticsreport) => {
      var result = {};

      MongoClient.connect(url, function (err, client) {

          var aggr = analyticsreport.aggregates[0];
          var schemaname = aggr.schemaname;
          var matches = aggr.matches;
          var aggregate = aggr.aggregate;

          var db = client.db();
          if (matches && matchesvalue) {

            matchesvalue.forEach(function (value) {
              var fieldname = value.searchfield;
              var match = matches.find(function (el) {
                return el.searchfield == fieldname;
              });
              if (match) {
                match.searchvalue = value.searchvalue;
              }
            });
            aggregate = common.getmatches(aggregate, matches, req.body.authkey);
          }

          if (db) {

            db.collection(schemaname).aggregate(aggregate)
              .toArray(function (err, docs) {

                if (docs && docs.length > 0) {
                  result = docs[0]
                }
                res.json(result)
              })
          }

        }, function(){
          if (client) client.close();
        })

    })

}


async function findcount(params) {
  return await Form.findcount(params)
}

async function exportdata(params) {
  return await Form.exportdata(params)
}


async function generateanalyticsreport(req, res, nextExp) {
  var authkey = req.body.authkey;
  var branch = authkey.branchid;
  var id = req.body.id;
  if (req.params.id){
    id = req.params.id
  }
  //console.log(req.body.search)
  var matchesvalue = req.body.search;

  if (req.body.authkey) {
    if (!matchesvalue) matchesvalue = [];
  }

  var now = moment();
  var localOffset = now.tz(branch.timezone).utcOffset();

  Analyticsreport.findById(id)
    .then((analytic) => {
      if(analytic){
      var aggregates = analytic.aggregates;
      var reporttype = analytic.reporttype;
      var mergefield = analytic.mergefield;
      var results = [];

      MongoClient.connect(url, function (err, client) {
        var first = true;

        var db = client.db();
        var dataset = []
        async.forEachSeries(aggregates, (aggr, next) => {
          var schemaname = aggr.schemaname;
          var matches = aggr.matches;
          if (!matches) matches = [];
          var groupitems = aggr.groupitems;
          var matchingfields = aggr.matchingfields;
          var formulafieldrow = aggr.formulafieldrow;
          var aggregate = aggr.aggregate;

          // check date location or utc
          matchesvalue.forEach(function (value) {
            var datatype = value.datatype;   
            if (datatype.toUpperCase() == "DATE" && value.locationtime) {
              var searchvalue = new Date(value.searchvalue);
              searchvalue.setUTCHours(0, 0, 0, 0);
              searchvalue.setUTCDate(searchvalue.getUTCDate() + 1);
              searchvalue.setUTCMinutes(searchvalue.getUTCMinutes() - localOffset);
              value.searchvalue = searchvalue;
              //console.log("value.searchvalue", value.searchvalue)
            }
          });

          matchesvalue.forEach(function (value) {
            var fieldname = value.searchfield;
            var match = matches.find(function (el) {
              return el.searchfield == fieldname;
            });
            if (match) {
                match.searchvalue = value.searchvalue;
            }
          });

          var branch = matches.find((e)=> {
            if (e.searchfield=="branchid") return e;
          })

          if (!branch) {
            matches.push({ searchfield: "branchid", searchvalue: req.body.authkey.branchid._id, datatype: "ObjectId", criteria: "eq"  })
          }
          else branch.searchvalue = req.body.authkey.branchid._id;

          var userid  = matches.find((e)=> {
            if (e.searchfield=="userid") return e;
          })
          if (!userid) matches.push({ searchfield: "userid", searchvalue: req.body.authkey._id, datatype: "ObjectId", criteria: "eq" })
          else userid.searchvalue = req.body.authkey._id;

          aggregate = common.getmatches(aggregate, matches, authkey);
          //console.log(JSON.stringify(aggregate))
          if (db) {
            db.collection(schemaname)
              .aggregate(aggregate)
              .toArray(function (err, docs) {
                if (docs && first) {
                  docs.forEach((element) => {
                    results.push(element);
                  });
                  if (reporttype == "Dataset") {
                    dataset.push({ "tablename": aggr.tablename, "data": results });
                  }
                  first = false;
                } else if (docs && !first && reporttype == "Dataset") {
                  dataset.push({ "tablename": aggr.tablename, "data": docs });
                } else if (docs && !first && !reporttype) {
                  docs.forEach((element) => {
                    //                    //console.log("element", element)
                    var match = false;
                    if (mergefield) {
                      results.push(element);
                      return;
                    }

                    var rws = results.filter(function (el) {
                      if (matchingfields) {
                        ////console.log("matchingfields", matchingfields);

                        for (var i = 0; i < matchingfields.length; i++) {
                          if (
                            element[matchingfields[i]] &&
                            el[matchingfields[i]] &&
                            element[matchingfields[i]].toString() ==
                              el[matchingfields[i]].toString()
                          ) {
                            match = true;
                          } else {
                            match = false;
                            break;
                          }
                        }

                        if (match) {
                          return el;
                        }
                      }
                    });
                    ////console.log("rws", rws);

                    rws.forEach(function (rw) {
                      for (var key in element) {
                        if (!rw[key]) {
                          // //console.log("element[key]", element[key])
                          // //console.log("[key]", key)
                          rw[key] = element[key];
                        }

                        if (groupitems) {
                          groupitems.forEach(function (groupitem) {
                            rw[element[groupitem.fieldname]] = element;
                          });
                        }

                        if (formulafieldrow) {
                          formulafieldrow.forEach(function (formulafield) {
                            if (
                              formulafield.fieldname == key &&
                              groupitem.fieldname != groupitem.fieldvalue
                            ) {
                              rw[
                                element[groupitem.fieldname] +
                                  "-" +
                                  groupitem.fieldvalue
                              ] = element[groupitem.fieldvalue];
                            }
                          });
                        }
                      }
                    });
                  });
                } else if (!first && reporttype == "2Table") {
                  var rowcount = 0;
                  docs.forEach((element) => {
                    var item = results[rowcount];
                    if (item) {
                      for (var key in element) {
                        item[key] = element[key];
                      }
                    } else {
                      results.push(element);
                    }
                    rowcount += 1;
                  });
                } else if (!first && reporttype == "Combined") {
                  Array.prototype.push.apply(results, docs);
                  results.sort(function (a, b) {
                    return a.followupdate - b.followupdate;
                  });
                  //results.concat(docs);
                }
                first = false;
                next();
              });
          }

        }, function () {
          if (client) client.close()

          if (mergefield){

            results.sort(function(a, b){

              var nameA=a[mergefield], nameB=b[mergefield]
              if (nameA < nameB) //sort string ascending
                  return -1
              if (nameA > nameB)
                  return 1
              return 0 //default return value (no sorting)
            })

          }
          if(req.body.report){
            //if(1){
            nextExp({results:results,fields:analytic.fields,footerfields:analytic.footerfields});
          }else{
            if (dataset.length > 0) res.json(dataset)
            else res.json(results);
          }
        })
      })
    }
    })

}
