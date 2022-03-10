const mongoose = require('mongoose');
const mongooseHistory = require('../lib/mongoose-history');
const mongooseautopopulate = require('mongoose-autopopulate');
const common = require('../helpers/common');

const CommunicationSchema = new mongoose.Schema({
  title: String,
  messagetype: {
    type: String  // EMAIL, MAILMERGE, SMS, WHATSAPP, NOTIFICATION
  },
  formid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Form",
    autopopulate: { maxDepth: 1 }
  },
  to: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    autopopulate: { maxDepth: 1 }
  }],
  roleid: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    autopopulate: { maxDepth: 1 }
  }],
  from: String,
  replyto: String,
  subject: {
    type: String
  },
  content: {
    type: String
  },
  documenttemplate : [String],
  mappingfield: String,
  attachments: [String],
  property: Object,
  status: { type: String, default: "active" }
}, {
  versionKey: false,
  timestamps: true
});

CommunicationSchema.plugin(mongooseautopopulate);

CommunicationSchema.options.selectPopulatedPaths = false;

var options = {customCollectionName: "histories", diffOnly: true, metadata: [{key: 'schemaname', value: 'communications'} ]}

CommunicationSchema.plugin(mongooseHistory, options)

CommunicationSchema.statics = {


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
      .then((communications) => {
        return communications;
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
      .then((communications) => {
        return communications;
      })

  }


};

module.exports = mongoose.model('Communication', CommunicationSchema);
