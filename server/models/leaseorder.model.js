const mongoose = require('mongoose');
const mongooseHistory = require('../lib/mongoose-history');
const mongooseautopopulate = require('mongoose-autopopulate');
const common = require('../helpers/common');

const LeaseorderSchema = new mongoose.Schema({
    prefix: String,
    leasenumber: Number,
    date : Date,
    returndate : Date,
    customerid: {
      required: true,
      type: mongoose.Schema.Types.ObjectId,
      refPath: "onModel",
      autopopulate: { maxDepth: 2 }
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
    assets: [{
      refid: {type: mongoose.Schema.Types.ObjectId, ref: 'Asset', autopopulate: { maxDepth: 2 }},
      quantity: Number,
      bookingdate :Date,
      periodtype: String,
      period: Number,
      discount: Number,
      cost: Number,
      taxes : [{type: mongoose.Schema.Types.ObjectId, ref: 'Tax', autopopulate: { maxDepth: 2 }}],
      totalcost: Number,
      status: String,
    }],
    items: [{
        item: {type: mongoose.Schema.Types.ObjectId, ref: 'Billitem', autopopulate: { maxDepth: 2 }},
        quantity: Number,
        taxes : [{type: mongoose.Schema.Types.ObjectId, ref: 'Tax', autopopulate: { maxDepth: 2 }}],
        periodtype: String,
        period: Number,
        discount: Number,
        cost: Number,
        totalcost: Number
    }],
    billid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bill",
      autopopulate: { maxDepth: 2 }
    },
    totalcost:Number,
    attachments: [],
    notes: String,
    property: Object,
    branchid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
    },
    addedby: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: { type: String, default: "requested" },
}, {
  versionKey: false,
  timestamps: true
});

LeaseorderSchema.plugin(mongooseautopopulate);

LeaseorderSchema.options.selectPopulatedPaths = false;

var options = {customCollectionName: "histories", diffOnly: true, metadata: [{key: 'schemaname', value: 'leaseorders'} ]}

LeaseorderSchema.plugin(mongooseHistory, options)

LeaseorderSchema.virtual('docnumber').
  get(function() {
    return `${this.prefix}-${this.jobnumber}`;
  })

LeaseorderSchema.statics = {


  getnextdocnumber(prefix, branchid) {

    var query = {};
    query["prefix"] = prefix;
    query["status"] = { "$ne": "deleted" };
    if (DATABASETYPE =="branchwise")
    {
      query["branchid"] = branchid;
    }

    return this.findOne(query)
      .select({ leasenumber: 1, _id: 0 })
      .sort({ leasenumber: -1 })
      .then(num => {
        var nextnum = 0;
        if (!num) {
          nextnum = 1;
        }
        if (num && num.leasenumber) {
          nextnum = num.leasenumber + 1;
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
      .then((leaseorders) => {
        return leaseorders;
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
      .then((leaseorders) => {
        return leaseorders;
      })

  }


};

module.exports = mongoose.model('Leaseorder', LeaseorderSchema);
