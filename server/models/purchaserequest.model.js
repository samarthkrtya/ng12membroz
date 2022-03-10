const mongoose = require('mongoose');
const mongooseHistory = require('../lib/mongoose-history');
const mongooseautopopulate = require('mongoose-autopopulate');
const mongooseLeanVirtuals = require('mongoose-lean-virtuals');
const common = require('../helpers/common');

const PurchaserequestSchema = new mongoose.Schema({
  prefix: String,
  requestnumber: {
    type: Number,
    required: true
  },
  date: Date,
  items: [{
    item: {type: mongoose.Schema.Types.ObjectId, ref: 'Billitem', autopopulate: { maxDepth: 2 }},
    quantity: Number,
    taxes : [{ tax : String, taxper : Number }],
    discount: Number,
    cost: Number,
    totalcost: Number
  }],
  totalamount: Number,
  taxamount: {
    type: Number
  },
  taxdetail: {},
  amount: {
    type: Number
  },
  attachments : [],
  property: Object,
  branchid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch'
  },
  addedby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    autopopulate: { maxDepth: 1 }
  },
  status: { type: String, default: "active" }
}, {
  versionKey: false,
  timestamps: true
});

PurchaserequestSchema.plugin(mongooseautopopulate);

PurchaserequestSchema.options.selectPopulatedPaths = false;

var options = {customCollectionName: "histories", diffOnly: true, metadata: [{key: 'schemaname', value: 'purchaserequests'} ]}

PurchaserequestSchema.plugin(mongooseHistory, options)

PurchaserequestSchema.plugin(mongooseLeanVirtuals);

PurchaserequestSchema.virtual('docnumber').
  get(function() {
    return `${this.prefix}-${this.requestnumber}`;
  })

PurchaserequestSchema.statics = {

  getnextdocnumber(prefix, branchid) {

    var query = {};
    query["prefix"] = prefix;
    query["status"] = { "$ne": "deleted" };
    if (DATABASETYPE =="branchwise")
    {
      query["branchid"] = branchid;
    }

    return this.findOne(query)
      .select({ requestnumber: 1, _id: 0 })
      .sort({ requestnumber: -1 })
      .then(num => {
        var nextnum = 0;
        if (!num) {
          nextnum = 1;
        }
        if (num && num.requestnumber) {
          nextnum = num.requestnumber + 1;
        }
        return nextnum;
      })
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
          "updatedAt" : -1,
          "createdAt" : -1
      }
    }

    if(pageNo < 0 || pageNo === 0) {
      return {"error" : true, "message" : "invalid page number, should start with 1"};
    }

    skip = size * (pageNo - 1)
    limit = size;
    fields["prefix"] = 1
    fields["requestnumber"] = 1
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
      .then((journals) => {
        return journals;
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
      .then((journals) => {
        return journals;
      })

  }

};

module.exports = mongoose.model('Purchaserequest', PurchaserequestSchema);
