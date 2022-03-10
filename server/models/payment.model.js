const mongoose = require('mongoose');
var Float = require('mongoose-float').loadType(mongoose);
const mongooseHistory = require('../lib/mongoose-history');
const mongooseautopopulate = require('mongoose-autopopulate');
const mongooseLeanVirtuals = require('mongoose-lean-virtuals');
const common = require('../helpers/common');

const PaymentSchema = new mongoose.Schema({
  memberid: {
    type: mongoose.Schema.Types.ObjectId, refPath: 'onModel',
    required: true,
    autopopulate: { maxDepth: 2 }
  },
  onModel: {
    type: String,
    default: 'Member',
    enum: [ 'Member', 'Prospect' ]
  },
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Paymentschedule',
    autopopulate: { maxDepth: 3 }
  },
  discount: Float,
  taxamount: {
      type: Float
  },
  taxdetail: Object,
  amount: {
    type: Float,
    required: true
  },
  totalamount: {
    type: Float,
    required: true
  },
  paidamount: {
    type: Float,
    required: true
  },
  mode:String,
  receivedby: {type: mongoose.Schema.Types.ObjectId, ref: 'User', autopopulate: { maxDepth: 1 } },
  paymentdate: {
      type:Date
  },
  prefix: String,
  receiptnumber: {
      type: Number
  },
  draccount: { type: mongoose.Schema.Types.ObjectId, ref: 'Accounthead', default: "5d5d4fdb93b7a12dfcfea805" },
  craccount: { type: mongoose.Schema.Types.ObjectId, ref: 'Accounthead', default: "5d8c4ce293b7a1063043b9d6" },
  couponid: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
  property: Object,
  branchid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch'
  },
  addedby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: { type: String, default: "Paid" }
}, {
  versionKey: false,
  timestamps: true
});

PaymentSchema.plugin(mongooseautopopulate);

PaymentSchema.options.selectPopulatedPaths = false;

var options = {customCollectionName: "histories", diffOnly: true, metadata: [{key: 'schemaname', value: 'payments'} ]}

PaymentSchema.plugin(mongooseHistory, options)

PaymentSchema.plugin(mongooseLeanVirtuals);

PaymentSchema.virtual('docnumber').
  get(function() {
    return `${this.prefix}-${this.receiptnumber}`;
  })


PaymentSchema.statics = {


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

    if(pageNo < 0 || pageNo === 0) {
      return {"error" : true, "message" : "invalid page number, should start with 1"};
    }

    skip = size * (pageNo - 1)
    limit = size;
    fields["prefix"] = 1
    fields["receiptnumber"] = 1
    fields["onModel"] = 1
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
      .then((payments) => {
        //console.log(payments)
        return payments;
      })
  },

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
      .then((payments) => {
        return payments;
      })

  }


};

module.exports = mongoose.model('Payment', PaymentSchema);
