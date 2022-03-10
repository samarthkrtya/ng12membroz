const mongoose = require('mongoose');
const mongooseHistory = require('../lib/mongoose-history');
const mongooseautopopulate = require('mongoose-autopopulate');
const common = require('../helpers/common');

const PaymenttermSchema = new mongoose.Schema({
  membershipid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Membership',
    required: true,
    autopopulate: { maxDepth: 2 }
  },
  paymentitem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Paymentitem',
    autopopulate: { maxDepth: 2 }
  },
  memberid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member'
  },
  period: {
    type: String
  },
  tenure: {
    type: Number
  },
  amount: {
    type:Number
  },
  totalamount: {
    type:Number
  },
  discount: {
    type: Number
  },
  date: {
    type: Number, default: 0 
  },
  startperiod: {
     type: Number, default: 0 
  },
  ismembershipfees: { type: Boolean, default: true },
  taxes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tax',
    autopopulate: { maxDepth: 2 }
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

PaymenttermSchema.plugin(mongooseautopopulate);

PaymenttermSchema.options.selectPopulatedPaths = false;

var options = {customCollectionName: "histories", diffOnly: true, metadata: [{key: 'schemaname', value: 'paymentterms'} ]}

PaymenttermSchema.plugin(mongooseHistory, options)

PaymenttermSchema.statics = {


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
      .then((paymentterms) => {
        return paymentterms;
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
      .then((paymentterms) => {
        return paymentterms;
      })

  }


};

module.exports = mongoose.model('Paymentterm', PaymenttermSchema);
