const mongoose = require('mongoose');
const mongooseHistory = require('../lib/mongoose-history');
const mongooseautopopulate = require('mongoose-autopopulate');
const mongooseLeanVirtuals = require('mongoose-lean-virtuals');
var Float = require('mongoose-float').loadType(mongoose);
const common = require('../helpers/common');

const PurchaseinvoicepaymentSchema = new mongoose.Schema({
  purchasebill: {type: mongoose.Schema.Types.ObjectId, ref: 'Purchaseinvoice', autopopulate: { maxDepth: 2 }},
  vendorid: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', require: true, autopopulate: { maxDepth: 1 } },
  paidamount: { type: Float, require: true },
  taxamount: Float,
  taxdetail: Object,
  prefix: String,
  receiptnumber: {
    type: Number,
    required: true
  },
  mode: String,
  paymentdate: {
    type: Date,
    require: true
  },
  draccount: { type: mongoose.Schema.Types.ObjectId, ref: 'Accounthead', default: "5d5d4cfe93b7a12dfcfea7b1" },
  craccount: { type: mongoose.Schema.Types.ObjectId, ref: 'Accounthead', default: "5d5d4fdb93b7a12dfcfea805" },
  branchid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch'
  },
  addedby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  property: Object,
  status: { type: String, default: "Paid" }
}, {
  versionKey: false,
  timestamps: true
});

PurchaseinvoicepaymentSchema.plugin(mongooseautopopulate);

PurchaseinvoicepaymentSchema.options.selectPopulatedPaths = false;

var options = {customCollectionName: "histories", diffOnly: true, metadata: [{key: 'schemaname', value: 'purchaseinvoicepayments'} ]}

PurchaseinvoicepaymentSchema.plugin(mongooseHistory, options)

PurchaseinvoicepaymentSchema.plugin(mongooseLeanVirtuals);

PurchaseinvoicepaymentSchema.virtual('docnumber').
  get(function() {
    return `${this.prefix}-${this.receiptnumber}`;
  })

PurchaseinvoicepaymentSchema.statics = {

  getnextdocnumber(prefix, branchid) {

    var query = {};
    query["prefix"] = prefix;
    query["status"] = { "$ne": "deleted" };
    if (DATABASETYPE =="branchwise")
    {
      query["branchid"] = branchid;
    }

    return this.findOne(query)
      .select({ receiptnumber: 1, _id: 0 })
      .sort({ receiptnumber: -1 })
      .then(num => {
        var nextnum = 0;
        if (!num) {
          nextnum = 1;
        }
        if (num && num.receiptnumber) {
          nextnum = num.receiptnumber + 1;
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
          "updatedAt" : -1,
          "createdAt" : -1
      }
    }

    if(pageNo < 0 || pageNo === 0) {
      return {"error" : true, "message" : "invalid page number, should start with 1"};
    }

    fields["prefix"] = 1
    fields["receiptnumber"] = 1
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
      .then((purchaseinvoicepayments) => {
        return purchaseinvoicepayments;
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
      .then((purchaseinvoicepayments) => {
        return purchaseinvoicepayments;
      })

  }


};

module.exports = mongoose.model('Purchaseinvoicepayment', PurchaseinvoicepaymentSchema);
