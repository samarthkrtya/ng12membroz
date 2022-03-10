const mongoose = require('mongoose');
const mongooseautopopulate = require('mongoose-autopopulate');
const mongooseHistory = require('../lib/mongoose-history');
const common = require('../helpers/common');

const ActivitytemplateSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  dispositionid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Disposition',
    autopopulate: { maxDepth: 2 }
  },
  serviceid: { // WORKSHOP
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    autopopulate: { maxDepth: 1 }
  },
  content: {
    type: String
  },
  type: {
    type: String,
    default: "callback" // Callback, meeting, tasks, appointment
  },
  formid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Form",
    required: true,
    autopopulate: { maxDepth: 2 }
  },
  priority: {
    type: String,
  },
  duedate: {
    type: Object,
  },
  mappingfield: String,
  mappingfieldrole: String,
  attachment: Object,
  assingeeuser: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  assingeerole: [{ type: mongoose.Schema.Types.ObjectId, ref: "Role" }],
  branchid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch",
  },
  addedby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  property: Object,
  status: { type: String, default: "active" },
}, { versionKey: false, timestamps: true });

ActivitytemplateSchema.plugin(mongooseautopopulate);

ActivitytemplateSchema.options.selectPopulatedPaths = false;

var options = {customCollectionName: "histories", diffOnly: true, metadata: [{key: 'schemaname', value: 'activitytemplates'} ]}

ActivitytemplateSchema.plugin(mongooseHistory, options)


ActivitytemplateSchema.statics = {


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
      .then((activitytemplates) => {
        return activitytemplates;
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
      .then((activitytemplates) => {
        return activitytemplates;
      })

  }


};

module.exports = mongoose.model('Activitytemplate', ActivitytemplateSchema);
