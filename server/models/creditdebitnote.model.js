const mongoose = require('mongoose');
const mongooseHistory = require('../lib/mongoose-history');
const mongooseautopopulate = require('mongoose-autopopulate');
const mongooseLeanVirtuals = require('mongoose-lean-virtuals');
const common = require('../helpers/common');

const CreditdebitnoteSchema = new mongoose.Schema({
  notesnumber: {
    type: Number,
    required: true,
  },
  prefix: String,
  customerid: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "onModel",
    autopopulate: { maxDepth: 2 }
  },
  onModel: {
    type: String,
    required: true,
    enum: ["Member", "Prospect", "Enquiry", "Vendor"],
  },
  billid: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    autopopulate: { maxDepth: 3 },
    refPath: "onModelBill",
  },
  onModelBill: {
    type: String,
    required: true,
    enum: ["Bill", "Purchaseinvoice", "Paymentschedule"],
  },
  date: Date,
  items: [],
  creditdebitdetail: {},
  adjustment: Number,
  amount: {
    type: Number,
  },
  taxamount: {
    type: Number
  },
  taxdetail: {},
  discount: Number,
  totalamount: Number,  
  balance: Number,  
  amountused: {
    type: Number,
    default: 0
  },
  notes: String,
  reason: String,
  type: String, // Vendor Credit, Customer Credit, Payment refund
  attachments: [],
  applyto: [
    {
      billid: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "onModelAdjustedBill",
      },
      onModelAdjustedBill: {
        type: String,
        enum: ["Bill", "PurchaseBill"],
      },
      amount: {
        type: Number,
      },
    },
  ],
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
  status: { type: String, default: "Unpaid" }
}, {
  versionKey: false,
  timestamps: true
});

CreditdebitnoteSchema.plugin(mongooseautopopulate);

CreditdebitnoteSchema.options.selectPopulatedPaths = false;

var options = {customCollectionName: "histories", diffOnly: true, metadata: [{key: 'schemaname', value: 'creditdebitnotes'} ]}

CreditdebitnoteSchema.plugin(mongooseHistory, options)

CreditdebitnoteSchema.plugin(mongooseLeanVirtuals);

CreditdebitnoteSchema.virtual('docnumber').
  get(function() {
    return `${this.prefix}-${this.notesnumber}`;
  })

CreditdebitnoteSchema.statics = {


  getnextdocnumber(prefix, branchid) {

    var query = {};
    query["prefix"] = prefix;
    query["status"] = { "$ne": "deleted" };
    if (DATABASETYPE =="branchwise")
    {
      query["branchid"] = branchid;
    }
    //console.log("query",query);
    return this.findOne(query)
      .select({ notesnumber: 1, _id: 0 })
      .sort({ notesnumber: -1 })
      .then(num => {
        //console.log("num==>",num);
        var nextnum = 0;
        if (!num) {
          nextnum = 1;
        }
        if (num && num.notesnumber) {
          nextnum = num.notesnumber + 1;
        }
        //console.log("nextnum==>",nextnum);
        return nextnum;
      })
      .catch((e) => console.log(e))
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
    fields["notesnumber"] = 1
    fields["onModel"] = 1
    fields["onModelBill"] = 1
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
      .then((creditdebitnotes) => {
        return creditdebitnotes;
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
      .then((creditdebitnotes) => {
        return creditdebitnotes;
      })

  }


}

module.exports = mongoose.model('Creditdebitnote', CreditdebitnoteSchema);
