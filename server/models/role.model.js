const mongoose = require('mongoose');
const mongooseHistory = require('../lib/mongoose-history');
const uniqueValidator = require('mongoose-unique-validator');
const mongooseautopopulate = require('mongoose-autopopulate');
const common = require('../helpers/common');

const RoleSchema = new mongoose.Schema({
  rolename: {
    type: String,
    required: true
  },
  roletype: { type: String, default: "A"}, // A= Admin, M= Member, S= Sales, T=Teacher
  dashboard: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dashboard',
    autopopulate: true
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
  permissions: [],  // RECORD PERMISSION
  dispositionpermissions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Disposition',
      autopopulate: {
        maxDepth: 1
      }
    }
  ], // REPORT PERMISSION
  reportpermissions: [], // REPORT PERMISSION,
  mobileapppermissions: [], // REPORT PERMISSION [ "My Info", "Appointment", "Support", "Offer", "Booking", "Leaverequest" ]
  bireportpermissions: [], // REPORT PERMISSION
  functionpermissions: [],
  status: { type: String, default: "active" }
}, {
  versionKey: false,
  timestamps: false
});

RoleSchema.plugin(mongooseautopopulate);

RoleSchema.options.selectPopulatedPaths = false;

var options = {customCollectionName: "histories", diffOnly: true, metadata: [{key: 'schemaname', value: 'roles'} ]}

RoleSchema.plugin(mongooseHistory, options)

RoleSchema.plugin(uniqueValidator);


//RoleSchema.options.selectPopulatedPaths = false;

RoleSchema.statics = {


  getbyfilter(params) {

    var query = common.generatequery(params);
    var fields = common.generateselect(params.select);
    var pageNo = parseInt(params.pageNo);
    var size = parseInt(params.size);
    var limit, skip;

    var sort = params.sort;
    if (!sort) {
      sort = {
          "rolename" : 1
      }
    }

    if(pageNo < 0 || pageNo === 0) {
      return {"error" : true, "message" : "invalid page number, should start with 1"};
    }

    skip = size * (pageNo - 1)
    limit = size;
    if (params.searchtext && !Array.isArray(params.searchtext)) {
      skip = 0;
      limit = 0;
    }
    return this.find(query)
    .select(fields)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean({ virtuals: true, autopopulate: { maxDepth: 2 } })
      .exec()
      .then((roles) => {
        return roles;
      })
      .catch((e) => console.log(e))

  },

  findcount(req) {

    var params = req.body;
    var size = parseInt(params.size);
    var query = common.generatequery(params);
    return this.countDocuments(query).exec().then((totalCount) =>{
        var totalPages = Math.ceil(totalCount / size)
        req.header = { "error" : false, "totalCount": totalCount , "totalPages": totalPages};
    })

  },

  exportdata(params) {

    var query = common.generatequery(params);
    var fields = common.generateselect(params.select);
    var sort = params.sort;
    if (!sort) {
      sort = {
          "updatedAt" : -1,
          "createdAt" : -1
      }
    }

    return this.find(query)
    .select(fields)
      .sort(sort)
      .lean({ virtuals: true, autopopulate: { maxDepth: 2 } })
      .exec()
      .then((roles) => {
        return roles;
      })

  }


};

module.exports = mongoose.model('Role', RoleSchema);
