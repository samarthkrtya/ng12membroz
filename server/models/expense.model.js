const mongoose = require('mongoose');
const mongooseHistory = require('../lib/mongoose-history');
const mongooseautopopulate = require('mongoose-autopopulate');
const mongooseLeanVirtuals = require('mongoose-lean-virtuals');
const common = require('../helpers/common');

const ExpenseSchema = new mongoose.Schema({
  prefix: String,
  vouchernumber: {
    type: Number,
    required: true
  },
  expenseaccount: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Accounthead',
    required: true,
    autopopulate: { maxDepth: 2 }
  },
  paidthrough: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Accounthead',
    autopopulate: { maxDepth: 2 }
  },
  vendorid:{
    type: mongoose.Schema.Types.ObjectId, ref: 'Vendor',
    autopopulate: { maxDepth: 2 }
  },
  amount: Number,
  date: Date,
  draccount: {type: mongoose.Schema.Types.ObjectId, ref: 'Accounthead'},
  craccount: {type: mongoose.Schema.Types.ObjectId, ref: 'Accounthead'},
  attachments : [],
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

ExpenseSchema.plugin(mongooseautopopulate);

ExpenseSchema.options.selectPopulatedPaths = false;

var options = {customCollectionName: "histories", diffOnly: true, metadata: [{key: 'schemaname', value: 'expenses'} ]}

ExpenseSchema.plugin(mongooseHistory, options)

ExpenseSchema.plugin(mongooseLeanVirtuals);

ExpenseSchema.virtual('docnumber').
  get(function() {
    return `${this.prefix}-${this.vouchernumber}`;
  })

ExpenseSchema.statics = {

  getnextdocnumber(prefix, branchid) {

    var query = {};
    query["prefix"] = prefix;
    query["status"] = { "$ne": "deleted" };
    if (DATABASETYPE =="branchwise")
    {
      query["branchid"] = branchid;
    }

    return this.findOne(query)
      .select({ vouchernumber: 1, _id: 0 })
      .sort({ vouchernumber: -1 })
      .then(num => {
        var nextnum = 0;
        if (!num) {
          nextnum = 1;
        }
        if (num && num.vouchernumber) {
          nextnum = num.vouchernumber + 1;
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
    fields["vouchernumber"] = 1
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
      .then((expenses) => {
        return expenses;
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
      .then((expenses) => {
        return expenses;
      })

  }

};

module.exports = mongoose.model('Expense', ExpenseSchema);
