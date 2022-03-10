const mongoose = require('mongoose');
const mongooseHistory = require('../lib/mongoose-history');
const mongooseautopopulate = require('mongoose-autopopulate');

const FormdataSchema = new mongoose.Schema({
  contextid: {
    type: mongoose.Schema.Types.ObjectId, refPath: "onModel",
    type: mongoose.Schema.Types.ObjectId, // Booking ID, Event ID, RESORT ID
    refPath: "onModel",
    autopopulate: { maxDepth: 2 }
  },
  onModel: {
    type: String,
    enum: ['Member', 'Enquiry', 'User', 'Prospect', "Formdata", "Form", "Branch", "Asset", "Joborder"],
    default: "User"
  },
  formid: {
    type: mongoose.Schema.Types.ObjectId, // Bookingfeedback, Visitorfeedback,Eventfeedbackform
    ref: 'Form',
    required: true,
    autopopulate: { maxDepth: 1 }
  },
  integration: String,
  property: Object,
  branchid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch'
  },
  addedby: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "onModelAddedby",
    autopopulate: { maxDepth: 2 }
  },
  onModelAddedby: {
    type: String,
    enum: ['Member', 'User'],
    default: "User"
  },
  status: { type: String, default: "active" }
}, {
  versionKey: false,
  timestamps: true
});


FormdataSchema.plugin(mongooseautopopulate);

FormdataSchema.options.selectPopulatedPaths = false;

var options = {customCollectionName: "histories", diffOnly: true, metadata: [{key: 'schemaname', value: 'formdatas'} ]}

FormdataSchema.plugin(mongooseHistory, options)

FormdataSchema.statics = {

  getbyfilter(params) {

    const common = require('../helpers/common');
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

    fields["onModel"] = 1
    fields["onModelAddedby"] = 1
    skip = size * (pageNo - 1)
    limit = size;
    if (params.searchtext && !Array.isArray(params.searchtext)) {
      skip = 0;
      limit = 0;
    }
    var property = false;
    for (const prop in fields) {
      if (prop.startsWith("property"))
      property = true;
    }
    if (!property) fields["property"] = 1;

    return this.find(query)
      .select(fields)
      .populate("branchid", { branchname: 1 })
      .populate("addedby", { fullname: 1 })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean({ virtuals: true, autopopulate: { maxDepth: 2 } })
      .exec()
      .then((formdatas) => {
        return formdatas;
      })
  },


  findcount(req) {
    const common = require('../helpers/common');
    var params = req.body;
    var size = parseInt(params.size);
    var query = common.generatequery(params);
    return this.countDocuments(query).exec().then((totalCount) =>{
        var totalPages = Math.ceil(totalCount / size)
        req.header = { "error" : false, "totalCount": totalCount , "totalPages": totalPages};
    })

  },

  exportdata(params) {
    const common = require('../helpers/common');

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
      .then((formdatas) => {
        return formdatas;
      })

  }

};

module.exports = mongoose.model('Formdata', FormdataSchema);
