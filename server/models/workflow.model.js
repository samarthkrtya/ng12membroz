const mongoose = require('mongoose');
const mongooseHistory = require('../lib/mongoose-history');
const mongooseautopopulate = require('mongoose-autopopulate');
const common = require('../helpers/common');

const WorkflowSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  formid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Form',
    required: true,
    autopopulate: { maxDepth: 2 }
  },
  description: {
    type: String
  },
  triggerprocess: {
    type: String
  },
  triggerRules: String,
  trigger: {
    triggerRules: String,
    fields: Array
  },
  scheduleaction: Object,
  criteria: [],
  approvers:
    {
      userid: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }],
      roleid: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role'
      }],
      activitytemplateid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Activitytemplate',
        autopopulate: { maxDepth: 1 }
      }
    },
  reviewers:
    {
      userid: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }],
      roleid: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role'
      }]
    },
  disposition: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Disposition',
    autopopulate: { maxDepth: 1 }
  },
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
      autopopulate: true
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
    webhooks: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Formdata',
      autopopulate: { maxDepth: 1 }
    }],
    updatetasks: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Activitytemplate',
      autopopulate: { maxDepth: 1 }
    }],
  },
  criteriaRules:String,
  criteria_pattern: String,
  property: Object,
  workflowtype: String,
  branchid: {type: mongoose.Schema.Types.ObjectId, ref: 'Branch'},
  status: { type: String, default: "active" }
}, { versionKey: false, timestamps : true });

WorkflowSchema.plugin(mongooseautopopulate);

WorkflowSchema.options.selectPopulatedPaths = false;

var options = {customCollectionName: "histories", diffOnly: true, metadata: [{key: 'schemaname', value: 'workflows'} ]}

WorkflowSchema.plugin(mongooseHistory, options)

WorkflowSchema.statics = {


  getbyfilter(params) {
    //console.log("params", params)
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

    //console.log("workflow sort", sort)

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
      .then((workflows) => {
        //console.log("workflows", workflows)
        return workflows;
      })
      .catch((e)=>console.log(e))

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
      .then((coupons) => {
        return coupons;
      })

  }


};

module.exports = mongoose.model('Workflow', WorkflowSchema);
