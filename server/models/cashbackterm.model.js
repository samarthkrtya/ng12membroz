const mongoose = require('mongoose');
const mongooseHistory = require('../lib/mongoose-history');
const mongooseautopopulate = require('mongoose-autopopulate');
const common = require('../helpers/common');

const CashbacktermSchema = new mongoose.Schema({
  category: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Formdata', 
    autopopulate : true,
    required: true
  },
  categorytype : String,
  member: Number, 
  nonmember: Number, // 300
  maxamount: Number,
  minamount: Number, // 300
  cashbackmethod: { type: String, default: "Percentage" }, //Percentage/Fix
  cashbackper: Number,  // 10
  cashbackamount: Number, // 100
  branchid: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch'},
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

CashbacktermSchema.plugin(mongooseautopopulate);

CashbacktermSchema.options.selectPopulatedPaths = false;

var options = {customCollectionName: "histories", diffOnly: true, metadata: [{key: 'schemaname', value: 'cashbackterms'} ]}

CashbacktermSchema.plugin(mongooseHistory, options)

CashbacktermSchema.statics = {

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
    //console.log("cashback", query)
    return this.find(query)
    .select(fields)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean({ virtuals: true, autopopulate: { maxDepth: 2 } })
      .exec()
      .then((cashbackterms) => {
        return cashbackterms;
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
      .then((cashbackterms) => {
        return cashbackterms;
      })

  }

};

module.exports = mongoose.model('Cashbackterm', CashbacktermSchema);
