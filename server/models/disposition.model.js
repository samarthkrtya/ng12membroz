const mongoose = require('mongoose');
const mongooseHistory = require('../lib/mongoose-history');
const mongooseautopopulate = require('mongoose-autopopulate');
const common = require('../helpers/common');

const DispositionSchema = new mongoose.Schema({
  disposition: { 
    type: String,
    required: true,
  },
  parentid: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Disposition', autopopulate: { maxDepth: 2 }
  },
  action: {
    type: String,
  },
  communication: {
    templateid: mongoose.Schema.Types.ObjectId,
    content: String,
    subject: String,
    attachment: String,
    communicationtype: String // EMAIL, SMS, WHATSPP
  },
  formid: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Form',
    required: true,
    autopopulate: { maxDepth: 1 }
  },
  fields: [{
    _id: String,
    fieldtype: String,
    fieldname: String,
    displayname: String,
    required: Boolean,
    lookupdata: Array,
    defaultvalue: String,
    form: Object,
    lookupfieldid: String,
    formorder: Number,
    value: Object,
    editable: Boolean,
  }],
  branchid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch'
  },
  addedby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rules: [],
  property: Object,
  status: { type: String, default: "active" }
}, {
  versionKey: false,
  timestamps: true
});

DispositionSchema.plugin(mongooseautopopulate);

DispositionSchema.options.selectPopulatedPaths = false;

var options = {customCollectionName: "histories", diffOnly: true, metadata: [{key: 'schemaname', value: 'dispositions'} ]}

DispositionSchema.plugin(mongooseHistory, options)

DispositionSchema.statics = {


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
      .then((dispositions) => {
        return dispositions;
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

};

module.exports = mongoose.model('Disposition', DispositionSchema);
