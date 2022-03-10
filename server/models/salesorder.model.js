const mongoose = require('mongoose');
const mongooseHistory = require('../lib/mongoose-history');
const mongooseautopopulate = require('mongoose-autopopulate');
const mongooseLeanVirtuals = require('mongoose-lean-virtuals');
var Float = require('mongoose-float').loadType(mongoose);
const common = require('../helpers/common');

const SalesorderSchema = new mongoose.Schema({
  prefix : String,
  sonumber: {
    type: Number,
    required: true
  },
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
  orderdate: Date,
  shipmentdate: Date,
  amount: Float,
  totalamount: Float,
  balance: Float,
  taxamount: Float,
  taxdetail: Object,
  discount: Float,
  type: String,
  property: Object,
  items: [{
    item: {type: mongoose.Schema.Types.ObjectId, ref: 'Billitem' ,autopopulate: { maxDepth: 2 }},
    quantity: Number,
    taxes : [{ tax : String, taxper : Number }],
    discount: Float,
    taxamount: Float,
    cost: Float,
    totalcost: Float
  }],
  services:[{
    refid: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: 'Service',
      autopopulate: { maxDepth: 2 }
    },
    taxes : [{type: mongoose.Schema.Types.ObjectId, ref: 'Tax', autopopulate: { maxDepth: 2 }} ],
    cost: Float,
    taxamount: Float,
    totalcost: Float,
    discount: Float,
  }],
  assets:[{
    refid: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: 'Asset',
      autopopulate: { maxDepth: 2 }
    },
    taxes : [{type: mongoose.Schema.Types.ObjectId, ref: 'Tax', autopopulate: { maxDepth: 2 }} ],
    cost: Float,
    totalcost: Float,
    taxamount: Float,
    discount: Float,
  }],
  property: Object,
  branchid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch'
  },
  addedby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: { type: String, default: "active" }
}, {
  versionKey: false,
  timestamps: true
});

SalesorderSchema.plugin(mongooseautopopulate);

SalesorderSchema.options.selectPopulatedPaths = false;

var options = {customCollectionName: "histories", diffOnly: true, metadata: [{key: 'schemaname', value: 'salesorders'} ]}

SalesorderSchema.plugin(mongooseHistory, options)

SalesorderSchema.plugin(mongooseLeanVirtuals);

SalesorderSchema.virtual('docnumber').
  get(function() {
    return `${this.prefix}-${this.sonumber}`;
  })

SalesorderSchema.statics = {

  getnextdocnumber(prefix, branchid) {

    var query = {};
    query["prefix"] = prefix;
    query["status"] = { "$ne": "deleted" };
    if (DATABASETYPE =="branchwise")
    {
      query["branchid"] = branchid;
    }

    return this.findOne(query)
      .select({ sonumber: 1, _id: 0 })
      .sort({ sonumber: -1 })
      .then(num => {
        var nextnum = 0;
        if (!num) {
          nextnum = 1;
        }
        if (num && num.sonumber) {
          nextnum = num.sonumber + 1;
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
    fields["sonumber"] = 1
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
      .then((journals) => {
        return journals;
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
      .then((journals) => {
        return journals;
      })

  }

};

module.exports = mongoose.model('Salesorder', SalesorderSchema);
