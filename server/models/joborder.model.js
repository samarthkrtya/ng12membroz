const mongoose = require('mongoose');
const mongooseHistory = require('../lib/mongoose-history');
const mongooseautopopulate = require('mongoose-autopopulate');
const common = require('../helpers/common');
const mongooseLeanVirtuals = require('mongoose-lean-virtuals');
var Float = require('mongoose-float').loadType(mongoose);

const JoborderSchema = new mongoose.Schema({
    prefix: String,
    jobnumber: Number,
    date : Date,
    dueby : Date,
    deliverydate : Date,
    customerid: {
      required: true,
      type: mongoose.Schema.Types.ObjectId,
      refPath: "onModel",
      autopopulate: { maxDepth: 2 }
    },
    assetid: {
      required: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: "Asset",
      autopopulate: { maxDepth: 1 }
    },
    onModel: {
      type: String,
      required: true,
      enum: ["Member", "Promotion", "User", "Prospect"],
    },
    inwardchallanid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Challan",
    },
    outwardchallanid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Challan",
    },
    items: [{
        item: {type: mongoose.Schema.Types.ObjectId, ref: 'Billitem', autopopulate: { maxDepth: 2 }},
        quantity: Number,
        taxes : [{type: mongoose.Schema.Types.ObjectId, ref: 'Tax', autopopulate: { maxDepth: 2 }}],
        discount: Number,
        cost: Number,
        totalcost: Number
    }],
    services:[{
      refid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        autopopulate: { maxDepth: 2 }
      },
      taxes : [{type: mongoose.Schema.Types.ObjectId, ref: 'Tax', autopopulate: { maxDepth: 2 }} ],
      assignee : {type: mongoose.Schema.Types.ObjectId, ref: 'User', autopopulate: { maxDepth: 2 }},
      cost: Float,
      taxamount: Float,
      totalcost: Float,
      discount: Float,
      status: String
    }],
    billid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bill",
      autopopulate: { maxDepth: 2 }
    },
    advisorid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      autopopulate: { maxDepth: 1 }
    },
    amount: Float,
    totalamount: Float,
    taxamount: Float,
    taxdetail: Object,
    discount: Float,
    property: Object,
    branchid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
    },
    addedby: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: { type: String, default: "active" },
}, {
  versionKey: false,
  timestamps: true
});

JoborderSchema.plugin(mongooseautopopulate);

JoborderSchema.options.selectPopulatedPaths = false;

var options = {customCollectionName: "histories", diffOnly: true, metadata: [{key: 'schemaname', value: 'joborders'} ]}

JoborderSchema.plugin(mongooseHistory, options)

JoborderSchema.plugin(mongooseLeanVirtuals);

JoborderSchema.virtual('docnumber').
  get(function() {
    return `${this.prefix}-${this.jobnumber}`;
  })

JoborderSchema.statics = {


  getnextdocnumber(prefix, branchid) {

    var query = {};
    query["prefix"] = prefix;
    query["status"] = { "$ne": "deleted" };
    if (DATABASETYPE =="branchwise")
    {
      query["branchid"] = branchid;
    }

    return this.findOne(query)
      .select({ jobnumber: 1, _id: 0 })
      .sort({ jobnumber: -1 })
      .then(num => {
        var nextnum = 0;
        if (!num) {
          nextnum = 1;
        }
        if (num && num.jobnumber) {
          nextnum = num.jobnumber + 1;
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
    fields["jobnumber"] = 1
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
      .then((joborders) => {
        return joborders;
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
      .then((joborders) => {
        return joborders;
      })

  }


};

module.exports = mongoose.model('Joborder', JoborderSchema);
