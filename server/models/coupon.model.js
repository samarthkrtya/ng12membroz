const mongoose = require('mongoose');
const mongooseHistory = require('../lib/mongoose-history');
const mongooseautopopulate = require('mongoose-autopopulate');
const common = require('../helpers/common');

const CouponSchema = new mongoose.Schema({
  couponcode: {
    type: String
  },
  coupontype: String,  //Fix amount / Percentage
  value: Number,  //Fix amount / Percentage
  category: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Formdata"
  }],
  items : [{ type: mongoose.Schema.Types.ObjectId, ref: "Billitem", autopopulate: { maxDepth: 2 }}],
  giftcards : [{ type: mongoose.Schema.Types.ObjectId, ref: "Billitem", autopopulate: { maxDepth: 2 }}],
  assets : [{ type: mongoose.Schema.Types.ObjectId, ref: "Asset", autopopulate: { maxDepth: 2 }}],  
  services : [{ type: mongoose.Schema.Types.ObjectId, ref: "Service", autopopulate: { maxDepth: 2 }}],  
  property: Object,
  status: { type: String, default: "active" },
  branchid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch"
  },
  addedby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }
}, {
  versionKey: false,
  timestamps: true
});

CouponSchema.plugin(mongooseautopopulate);

CouponSchema.options.selectPopulatedPaths = false;

var options = {customCollectionName: "histories", diffOnly: true, metadata: [{key: 'schemaname', value: 'coupons'} ]}

CouponSchema.plugin(mongooseHistory, options)

CouponSchema.statics = {


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
      .then((coupons) => {
        return coupons;
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
      .then((coupons) => {
        return coupons;
      })

  }


};

module.exports = mongoose.model('Coupon', CouponSchema);
