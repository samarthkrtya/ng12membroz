const mongoose = require('mongoose');
const mongooseHistory = require('../lib/mongoose-history');
const common = require('../helpers/common');
const mongooseautopopulate = require('mongoose-autopopulate');
const mongooseLeanVirtuals = require('mongoose-lean-virtuals');

const SupportSchema = new mongoose.Schema({
  prefix : String,
  spnumber: {
    type: Number,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  customerid: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'onModel',
    autopopulate: { maxDepth: 2 }
  },
  onModel: {
    type: String,
    enum: ['Member', 'User', 'Promotion']
  },
  category: {
    type: String
  },
  content: {
    type: String,
    required: true
  },
  attachments: [],
  assignuserid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    autopopulate: { maxDepth: 2 }
  },
  response: [{
    responderid: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'response.onModel',
      autopopulate: { maxDepth: 2 }
    },
    onModel: {
      type: String,
      enum: ['Member', 'User', 'Enquiry', 'Prospect']
    },
    content: String,
    timestamp: Date,
    attachments: []
  }],
  supportrole: [],
  property: Object,
  branchid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    autopopulate: { maxDepth: 2 }
  },
  addedby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: { type: String, default: "Requested" }
}, {
  versionKey: false,
  timestamps: true
});

SupportSchema.plugin(mongooseautopopulate);

SupportSchema.options.selectPopulatedPaths = false;

var options = { customCollectionName: "histories", diffOnly: true, metadata: [{ key: 'schemaname', value: 'supports' }] }

SupportSchema.plugin(mongooseHistory, options)
SupportSchema.plugin(mongooseLeanVirtuals);

SupportSchema.virtual('docnumber').
  get(function() {
    return `${this.prefix}-${this.spnumber}`;
  })


SupportSchema.statics = {

  getnextdocnumber(prefix, branchid) {

    var query = {};
    query["prefix"] = prefix;
    query["status"] = { "$ne": "deleted" };
    if (DATABASETYPE =="branchwise")
    {
      query["branchid"] = branchid;
    }

    return this.findOne(query)
      .select({ spnumber: 1, _id: 0 })
      .sort({ spnumber: -1 })
      .then(num => {
        var nextnum = 0;
        if (!num) {
          nextnum = 1;
        }
        if (num && num.spnumber) {
          nextnum = num.spnumber + 1;
        }
        return nextnum;
      })
      .catch((e) => console.log(e));
  },


  getbyfilter(params) {

    var query = common.generatequery(params);
    var fields = common.generateselect(params.select);
    var pageNo = parseInt(params.pageNo);
    var size = parseInt(params.size);
    var limit, skip;

    var sort = params.sort;
    if (!sort) {
      sort = {
        "updatedAt": -1,
        "createdAt": -1
      }
    }

    if (pageNo < 0 || pageNo === 0) {
      return { "error": true, "message": "invalid page number, should start with 1" };
    }

    fields["prefix"] = 1
    fields["spnumber"] = 1
    fields["onModel"] = 1
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
      .then((supports) => {
        return supports;
      })

  },

  findcount(req) {

    var params = req.body;
    var size = parseInt(params.size);
    var query = common.generatequery(params);
    return this.countDocuments(query).exec().then((totalCount) => {
      var totalPages = Math.ceil(totalCount / size)
      req.header = { "error": false, "totalCount": totalCount, "totalPages": totalPages };
    })

  },

  exportdata(params) {

    var query = common.generatequery(params);
    var fields = common.generateselect(params.select);
    var sort = params.sort;
    if (!sort) {
      sort = {
        "updatedAt": -1,
        "createdAt": -1
      }
    }

    return this.find(query)
      .select(fields)
      .sort(sort)
      .lean({ virtuals: true, autopopulate: { maxDepth: 2 } })
      .exec()
      .then((supports) => {
        return supports;
      })

  }


}

module.exports = mongoose.model('Support', SupportSchema);
