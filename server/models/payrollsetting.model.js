const mongoose = require('mongoose');
const mongooseHistory = require('../lib/mongoose-history');
const common = require('../helpers/common');

const PayrollsettingSchema = new mongoose.Schema({
  frequency: String,
  closingday: Number,
  endingday: Number,
  commission: {
    deductservicecost: Boolean,
    deductproductcost: Boolean,
    includetips: Boolean,
    subtractdiscount: Boolean,
    subtractpackagediscount: Boolean
  },
  commissiontype: String,
  revenuecomponent: [],
  service: {
    employees: [
      {
        employeeid: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        serviceid: { type: mongoose.Schema.Types.ObjectId, ref: 'Service'},
        commission: Number
      }
    ],
  },
  membership: {
    employees: [
      {
        employeeid: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        membershipid: { type: mongoose.Schema.Types.ObjectId, ref: 'Membership'},
        commission: Number
      }
    ],
  },
  tier : [
    {  
        employee : [{
          employeeid: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
          commission: Number
        }],
        minrev: Number,
        maxrev:Number,
        order:Number
    }
  ],
  property: Object,
  branchid: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch'},
  addedby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: { type: String, default: "active" }
},
{
  versionKey: false,
  timestamps: true
});

var options = {customCollectionName: "histories", diffOnly: true, metadata: [{key: 'schemaname', value: 'payrolls'} ]}

PayrollsettingSchema.plugin(mongooseHistory, options)

PayrollsettingSchema.statics = {

  getbyfilter(params) {

    var query = common.generatequery(params);

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
    console.log("query", query)
    return this.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean({ virtuals: true, autopopulate: { maxDepth: 2 } })
      .exec()
      .then((payrolls) => {
        return payrolls;
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

    var sort = params.sort;
    if (!sort) {
      sort = {
          "updatedAt" : -1,
          "createdAt" : -1
      }
    }

    return this.find(query)
      .sort(sort)
      .lean({ virtuals: true, autopopulate: { maxDepth: 2 } })
      .exec()
      .then((payrolls) => {
        return payrolls;
      })

  }


}

module.exports = mongoose.model('Payrollsetting', PayrollsettingSchema);
