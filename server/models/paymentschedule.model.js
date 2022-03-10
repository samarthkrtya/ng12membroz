const mongoose = require('mongoose');
var Float = require('mongoose-float').loadType(mongoose);
const mongooseHistory = require('../lib/mongoose-history');
const mongooseautopopulate = require('mongoose-autopopulate');
const mongooseLeanVirtuals = require('mongoose-lean-virtuals');
const common = require('../helpers/common');

const PaymentscheduleSchema = new mongoose.Schema({
  memberid: {
    type: mongoose.Schema.Types.ObjectId, refPath: 'onModel',
    required: true,
    autopopulate: { maxDepth: 1 }
  },
  onModel: {
    type: String,
    default: 'Member',
    enum: [ 'Member', 'Prospect' ]
  },
  paymentterms: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Paymentterm',
      autopopulate: { maxDepth: 2 }
  },
  scheduledate: {
      type: Date
  },
  adjustment: Float,
  negativeadjustment: Float,
  taxamount: {
      type: Float
  },
  taxdetail: Object,
  amount: {
    type: Float
  },
  totalamount: {
    type: Float
  },
  balance: {
    type: Float,
    default: 0
  },
  totaladjustment: {
    type: Float,
    default: 0
  },
  paidamount: {
      type: Float,
      default: 0
  },
  prefix: String,
  invoicenumber: {
      type: Number,
      default: 0
  },
  property: Object,
  draccount: { type: mongoose.Schema.Types.ObjectId, ref: 'Accounthead', default: "5d8c4ce293b7a1063043b9d6" },
  craccount: { type: mongoose.Schema.Types.ObjectId, ref: 'Accounthead', default: "5d5d4cfe93b7a12dfcfea7b5" },
  branchid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    autopopulate: { maxDepth: 2 }
  },
  addedby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: { type: String, default: "Unpaid" }
}, {
  versionKey: false,
  timestamps: true
});

PaymentscheduleSchema.plugin(mongooseautopopulate);

PaymentscheduleSchema.options.selectPopulatedPaths = false;

var options = {customCollectionName: "histories", diffOnly: true, metadata: [{key: 'schemaname', value: 'paymentitemschedules'} ]}

PaymentscheduleSchema.plugin(mongooseLeanVirtuals);

PaymentscheduleSchema.virtual('docnumber').
  get(function() {
    if (this.invoicenumber)
      return `${this.prefix}-${this.invoicenumber}`;
    else
      return `---`;
  })

PaymentscheduleSchema.statics = {


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
    fields["invoicenumber"] = 1
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
      .then((paymentitemschedules) => {
        return paymentitemschedules;
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
      .select({ invoicenumber: 1, _id: 0 })
      .sort({ invoicenumber: -1 })
      .then(num => {
        var nextnum = 0;
        if (!num || num == 0) {
          nextnum = 1;
        }
        if (num && num.invoicenumber) {
          nextnum = num.invoicenumber + 1;
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
      .then((paymentitemschedules) => {
        return paymentitemschedules;
      })

  }


};

module.exports = mongoose.model('Paymentschedule', PaymentscheduleSchema);
