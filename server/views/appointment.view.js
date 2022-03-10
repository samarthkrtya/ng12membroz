const mongoose = require('mongoose');
const mongooseautopopulate = require('mongoose-autopopulate');
const common = require('../helpers/common');
var ObjectID = require('mongodb').ObjectID;
const AppointmentviewSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  action: {
    type: String,
    default: "callback" // Callback, meeting, tasks
  },
  customername: {
    type: String,
  },
  customerid: {
    type: mongoose.Schema.Types.ObjectId, 
  },
  duedate: {
    type: Date,
  },
  branchid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch'
  },
  addedby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  property: Object,
  status: { type: String, default: "active" }
}, {
  versionKey: false
});

AppointmentviewSchema.plugin(mongooseautopopulate);

AppointmentviewSchema.options.selectPopulatedPaths = false;

AppointmentviewSchema.statics = {


  getfilterview(params) {
    //console.log("params", params.search)
    var query = common.generatequery(params);
    var fields = common.generateselect(params.select);
    var pageNo = parseInt(params.pageNo);
    var size = parseInt(params.size);
    var limit, skip;

    var sort = params.sort;
    if (!sort) {
      sort = {
          "updatedAt" : -1,
          "createdAt" : -1
      }
    }

    if(pageNo < 0 || pageNo === 0) {
      return {"error" : true, "message" : "invalid page number, should start with 1"};
    }

    skip = size * (pageNo - 1)
    limit = size;
    //console.log("query", JSON.stringify(query))
    var q = { 
      "status" : "active", 
      "$and" : [
          {
              "$or" : [
                  {
                      "assigneeuser" : ObjectID("6130b1b3bfd7602f90774de2")
                  }, 
                  {
                      "assigneerole" : ObjectID("6066c57499e17f24a4db4495")
                  }
              ]
          }, 
          {
              "$or" : [
                  {
                      "branchid" : ObjectID("615c46f7bfd7600bf0d36074")
                  }, 
                  {
                      "branchid" : {
                          "$exists" : false
                      }
                  }
              ]
          }
      ]
  }
    return this.find(query)
    .select(fields)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean({ virtuals: true, autopopulate: { maxDepth: 2 } })
      .exec()
      .then((activities) => {
        return activities;
      })
      .catch((e) => console.log(e))

  },


};

module.exports = mongoose.model('Appointmentview', AppointmentviewSchema);