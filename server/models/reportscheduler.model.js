const mongoose = require('mongoose');
const mongooseHistory = require('../lib/mongoose-history');
const mongooseautopopulate = require('mongoose-autopopulate');
const common = require('../helpers/common');

const ReportschedulerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  schemaname: {
    type: String,
    required: true
  },
  aggregate: [],
  schedule: { /// WEEKLY /MONTHLY/DAILY
    type: String,
    required: true
  },
  inputparams: [],
  action: {
    email: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Communication',
      autopopulate: { maxDepth: 3 }
    }],
    mailmerge: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Communication',
      autopopulate: { maxDepth: 2 }
    }],
    sms: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Communication',
      autopopulate: { maxDepth: 2 }
    }],
    whatsapp: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Communication',
      autopopulate: { maxDepth: 2 }
    }],
    notification: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Communication',
      autopopulate: { maxDepth: 2 }
    }],
    tasks: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Activitytemplate',
      autopopulate: { maxDepth: 2 }
    }],
    updatetasks: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Activitytemplate',
      autopopulate: { maxDepth: 1 }
    }],
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
  versionKey: false,
  timestamps: true
});

ReportschedulerSchema.plugin(mongooseautopopulate);

ReportschedulerSchema.options.selectPopulatedPaths = false;

var options = {customCollectionName: "histories", diffOnly: true, metadata: [{key: 'schemaname', value: 'reportschedulers'} ]}

ReportschedulerSchema.plugin(mongooseHistory, options)


ReportschedulerSchema.statics = {


  getbyfilter(params) {

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
      .then((reportschedulers) => {
        return reportschedulers;
      })

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
      .then((reportschedulers) => {
        return reportschedulers;
      })

  }


}

module.exports = mongoose.model('Reportscheduler', ReportschedulerSchema);
