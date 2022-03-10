const mongoose = require('mongoose');
const mongooseHistory = require('../lib/mongoose-history');
const mongooseautopopulate = require('mongoose-autopopulate');
const mongooseLeanVirtuals = require('mongoose-lean-virtuals');
const common = require('../helpers/common');

const ChallanSchema = new mongoose.Schema({
  chnumber: {
    type: Number,
    required: true
  },
  prefix : String,
  customerid: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "onModel",
      required: true,
      autopopulate: { maxDepth: 2 }
  },
  onModel: {
    type: String,
    required: true,
    enum: ["Member", "Promotion", "User", "Prospect", "Vendor"],
  },
  type: String, //Inward, Outward
  challandate : Date,
  items: [{
    item: {type: mongoose.Schema.Types.ObjectId, ref: 'Billitem', autopopulate: { maxDepth: 2 }},
    quantity: Number,
    barcode: String
  }],
  branchid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch'
  },
  addedby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  property: Object,
  status: { type: String, default: "active" }
}, {
  versionKey: false,
  timestamps: true
});

ChallanSchema.plugin(mongooseautopopulate);

ChallanSchema.options.selectPopulatedPaths = false;

var options = {customCollectionName: "histories", diffOnly: true, metadata: [{key: 'schemaname', value: 'challans'} ]}

ChallanSchema.plugin(mongooseHistory, options)

ChallanSchema.plugin(mongooseLeanVirtuals);

ChallanSchema.virtual('docnumber').
  get(function() {
    return `${this.prefix}-${this.chnumber}`;
  })

ChallanSchema.statics = {

  getnextdocnumber(prefix, branchid) {

    var query = {};
    query["prefix"] = prefix;
    query["status"] = { "$ne": "deleted" };
    if (DATABASETYPE =="branchwise")
    {
      query["branchid"] = branchid;
    }

    return this.findOne(query)
      .select({ chnumber: 1, _id: 0 })
      .sort({ chnumber: -1 })
      .then(num => {
        var nextnum = 0;
        if (!num) {
          nextnum = 1;
        }
        if (num && num.chnumber) {
          nextnum = num.chnumber + 1;
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
    fields["chnumber"] = 1
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
      .then((challans) => {
        return challans;
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

};

module.exports = mongoose.model('Challan', ChallanSchema);
