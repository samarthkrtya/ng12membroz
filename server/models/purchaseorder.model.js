const mongoose = require('mongoose');
const mongooseHistory = require('../lib/mongoose-history');
const mongooseautopopulate = require('mongoose-autopopulate');
const mongooseLeanVirtuals = require('mongoose-lean-virtuals');
var Float = require('mongoose-float').loadType(mongoose);
const common = require('../helpers/common');

const PurchaseorderSchema = new mongoose.Schema({
  prefix : String,
  ponumber: {
    type: Number,
    required: true
  },
  vendorid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
      autopopulate: { maxDepth: 2 }
  },
  orderdate: Date,
  shippingdate: Date,
  receivedate: Date,
  billingaddress : String,
  shippingaddress : String,
  attachments : [],
  items: [{
    item: {type: mongoose.Schema.Types.ObjectId, ref: 'Billitem', autopopulate: { maxDepth: 2 }},
    quantity: Number,
    tax : [{ tax : String, taxper : Number }],
    discount: Float,
    taxamount: Float,
    cost: Float,
    totalcost: Float
  }], // { itemname: "Breakfast", qty: 1, cost: 500, tax: 18, totalcost: 500 }
  taxamount: {
    type: Float
  },
  taxdetail: {},
  totalamount: Float,
  amount: {
    type: Float
  },
  branchid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch'
  },
  addedby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  property: Object,
  status: { type: String, default: "Draft" }
}, {
  versionKey: false,
  timestamps: true
});

PurchaseorderSchema.plugin(mongooseautopopulate);

PurchaseorderSchema.options.selectPopulatedPaths = false;

var options = {customCollectionName: "histories", diffOnly: true, metadata: [{key: 'schemaname', value: 'purchaseorders'} ]}

PurchaseorderSchema.plugin(mongooseHistory, options)

PurchaseorderSchema.plugin(mongooseLeanVirtuals);

PurchaseorderSchema.virtual('docnumber').
  get(function() {
    return `${this.prefix}-${this.ponumber}`;
  })

PurchaseorderSchema.statics = {

  getnextdocnumber(prefix, branchid) {

    var query = {};
    query["prefix"] = prefix;
    query["status"] = { "$ne": "deleted" };
    if (DATABASETYPE =="branchwise")
    {
      query["branchid"] = branchid;
    }

    return this.findOne(query)
      .select({ ponumber: 1, _id: 0 })
      .sort({ ponumber: -1 })
      .then(num => {
        var nextnum = 0;
        if (!num) {
          nextnum = 1;
        }
        if (num && num.ponumber) {
          nextnum = num.ponumber + 1;
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
    fields["ponumber"] = 1
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
      .then((purchaseorders) => {
        return purchaseorders;
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
      .then((purchaseorders) => {
        return purchaseorders;
      })

  }


};

module.exports = mongoose.model('Purchaseorder', PurchaseorderSchema);
