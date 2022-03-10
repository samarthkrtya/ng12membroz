const mongoose = require('mongoose');
const mongooseHistory = require('../lib/mongoose-history');
const mongooseautopopulate = require('mongoose-autopopulate');
const mongooseLeanVirtuals = require('mongoose-lean-virtuals');
var Float = require('mongoose-float').loadType(mongoose);
const common = require('../helpers/common');

const PurchaseinvoiceSchema = new mongoose.Schema({
  prefix : String,
  pinumber: {
    type: Number,
    required: true
  },
  vendorid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
      autopopulate: { maxDepth: 2 }
  },
  invoicedate: Date,
  duedate: Date,
  billingaddress : String,
  attachments : [],
  items: [{
    item: {type: mongoose.Schema.Types.ObjectId, ref: 'Billitem', autopopulate: { maxDepth: 2 }},
    quantity: Number,
    taxes : [{type: mongoose.Schema.Types.ObjectId, ref: 'Tax', autopopulate: { maxDepth: 2 }} ],
    discount: { type: Float, default: 0 },
    cost: Float,
    totalcost: Float
  }],
  taxamount: {
    type: Float
  },
  taxdetail: {},
  totalamount: Float,
  amount: {
    type: Float
  },
  balance : Float,
  paidamount : Float,
  draccount: { type: mongoose.Schema.Types.ObjectId, ref: 'Accounthead', default: "5d5d4fdb93b7a12dfcfea7ee" },
  craccount: { type: mongoose.Schema.Types.ObjectId, ref: 'Accounthead', default: "5d5d4cfe93b7a12dfcfea7b1" },
  branchid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch'
  },
  addedby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  property: Object,
  status: { type: String, default: "Unpaid" }
}, {
  versionKey: false,
  timestamps: true
});

PurchaseinvoiceSchema.plugin(mongooseautopopulate);

PurchaseinvoiceSchema.options.selectPopulatedPaths = false;

var options = {customCollectionName: "histories", diffOnly: true, metadata: [{key: 'schemaname', value: 'purchaseinvoices'} ]}

PurchaseinvoiceSchema.plugin(mongooseHistory, options)

PurchaseinvoiceSchema.plugin(mongooseLeanVirtuals);

PurchaseinvoiceSchema.virtual('docnumber').
  get(function() {
    return `${this.prefix}-${this.pinumber}`;
  })

PurchaseinvoiceSchema.statics = {

  getnextdocnumber(prefix, branchid) {

    var query = {};
    query["prefix"] = prefix;
    query["status"] = { "$ne": "deleted" };
    if (DATABASETYPE =="branchwise")
    {
      query["branchid"] = branchid;
    }

    return this.findOne(query)
      .select({ pinumber: 1, _id: 0 })
      .sort({ pinumber: -1 })
      .then(num => {
        var nextnum = 0;
        if (!num) {
          nextnum = 1;
        }
        if (num && num.pinumber) {
          nextnum = num.pinumber + 1;
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
    fields["pinumber"] = 1
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
      .then((purchaseinvoices) => {
        return purchaseinvoices;
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
      .then((purchaseinvoices) => {
        return purchaseinvoices;
      })

  }


};

module.exports = mongoose.model('Purchaseinvoice', PurchaseinvoiceSchema);
