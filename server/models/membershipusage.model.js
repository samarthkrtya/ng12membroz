const mongoose = require('mongoose');
const mongooseautopopulate = require('mongoose-autopopulate');
const mongooseHistory = require('../lib/mongoose-history');
const common = require('../helpers/common');

const MembershipusageSchema = new mongoose.Schema({
  customerid: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'onModel'
  },
  onModel: {
    type: String,
    enum: ['Member', 'Prospect']
  },
  membershipid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Membership"
  },
  usage: {
    refid: { type: mongoose.Schema.Types.ObjectId, refPath: 'onModel' },
    onModel: {
      type: String,
      enum: ['Billitem', 'Service', 'Asset', 'Booking']
    },
    quantity: Number,
    discount: Number,
    cost: Number,
    totalcost: Number
  },
  date: Date,
  billid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bill'
  },
  property: Object,
  branchid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch"
  }
}, {
  versionKey: false,
  timestamps: true
});

MembershipusageSchema.plugin(mongooseautopopulate);

MembershipusageSchema.options.selectPopulatedPaths = false;

var options = {customCollectionName: "histories", diffOnly: true, metadata: [{key: 'schemaname', value: 'membershipusages'} ]}

MembershipusageSchema.plugin(mongooseHistory, options)

MembershipusageSchema.statics = {


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
      .then((membershipusages) => {
        return membershipusages;
      })
      .catch((e) => console.log(e))

  },

};

module.exports = mongoose.model('Membershipusage', MembershipusageSchema);
