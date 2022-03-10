const mongoose = require('mongoose');
const mongooseHistory = require('../lib/mongoose-history');
const mongooseautopopulate = require('mongoose-autopopulate');
const mongooseLeanVirtuals = require('mongoose-lean-virtuals');
var Float = require('mongoose-float').loadType(mongoose);
const common = require('../helpers/common');

const BillpaymentSchema = new mongoose.Schema({
  prefix: String,
  receiptnumber: {
    type: Number,
    required: true
  },
  billid: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    autopopulate: { maxDepth: 3 },
    ref: 'Bill'
  },
  customerid: {
    type: mongoose.Schema.Types.ObjectId, refPath: "onModel", autopopulate: { maxDepth: 2 }
  },
  onModel: {
    type: String,
    enum: ['Member', 'Enquiry', 'User', 'Prospect']
  },
  paidamount: Float,
  taxdetail: Object,
  taxamount: Float,
  rounding: Float,
  walletamount: { type: Float, default: 0 },
  couponamount: { type: Float, default: 0 },
  paymentdate: Date,
  draccount: { type: mongoose.Schema.Types.ObjectId, ref: 'Accounthead', default: "5d5d4fdb93b7a12dfcfea805" },
  craccount: { type: mongoose.Schema.Types.ObjectId, ref: 'Accounthead', default: "5d5d4cfe93b7a12dfcfea7ae" },
  couponcode: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon', autopopulate: { maxDepth: 1 } },
  branchid: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  receivedby: { type: mongoose.Schema.Types.ObjectId, ref: 'User', autopopulate: { maxDepth: 1 } },
  sellby : { type : mongoose.Schema.Types.ObjectId , ref : 'User' , autopopulate : { maxDepth : 1 }},
  addedby: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  property: Object,
  status: { type: String, default: "Paid" }
}, {
  versionKey: false,
  timestamps: true
});

BillpaymentSchema.plugin(mongooseautopopulate);

BillpaymentSchema.options.selectPopulatedPaths = false;

var options = { customCollectionName: "histories", diffOnly: true, metadata: [{ key: 'schemaname', value: 'billpayments' }] }

BillpaymentSchema.plugin(mongooseHistory, options)

BillpaymentSchema.plugin(mongooseLeanVirtuals);

BillpaymentSchema.virtual('docnumber').
  get(function() {
    return `${this.prefix}-${this.receiptnumber}`;
  })


BillpaymentSchema.statics = {

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
      .then((billpayments) => {
        return billpayments;
      })
      .catch((e) => console.log(e))

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
      .then((billpayments) => {
        return billpayments;
      })

  }

};

module.exports = mongoose.model('Billpayment', BillpaymentSchema);
