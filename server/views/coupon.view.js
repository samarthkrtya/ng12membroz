const mongoose = require('mongoose');
const common = require('../helpers/common');

const CouponviewSchema = new mongoose.Schema({
  couponcode: {
    type: String
  },
  coupontype: String,  //Fix amount / Percentage
  value: Number,  //Fix amount / Percentage
  category: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Formdata"
  }],
  items : [],
  giftcards : [],
  assets : [],  
  services : [],  
  availcoupon : Number,
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
  versionKey: false
});

CouponviewSchema.statics = {

  getfilterview(params) {

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


};

module.exports = mongoose.model('Couponview', CouponviewSchema);
