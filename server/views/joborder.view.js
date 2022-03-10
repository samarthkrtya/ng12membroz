const mongoose = require('mongoose');
const mongooseautopopulate = require('mongoose-autopopulate');
const common = require('../helpers/common');

const JoborderviewSchema = new mongoose.Schema({
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
    activities:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Activity",
    }],
    services:[{
        refid: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Service',
          autopopulate: { maxDepth: 2 }
        },
        taxes : [{type: mongoose.Schema.Types.ObjectId, ref: 'Tax', autopopulate: { maxDepth: 2 }} ],
        assignee : {type: mongoose.Schema.Types.ObjectId, ref: 'User', autopopulate: { maxDepth: 2 }},
        cost: Number,
        taxamount: Number,
        totalcost: Number,
        discount: Number,
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
    amount: Number,
    totalamount: Number,
    taxamount: Number,
    taxdetail: Object,
    discount: Number,
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
  versionKey: false
});

JoborderviewSchema.plugin(mongooseautopopulate);

JoborderviewSchema.options.selectPopulatedPaths = false;

JoborderviewSchema.statics = {


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
      .then((joborders) => {
        return joborders;
      })
      .catch((e) => console.log(e))

  },


};

module.exports = mongoose.model('Joborderview', JoborderviewSchema);
