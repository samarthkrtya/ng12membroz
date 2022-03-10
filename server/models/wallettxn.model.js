const mongoose = require('mongoose');
const mongooseautopopulate = require('mongoose-autopopulate');
const common = require('../helpers/common');
const Member = require('../models/member.model');
const Prospect = require('../models/prospect.model');
const mongooseHistory = require('../lib/mongoose-history');

const WallettxnSchema = new mongoose.Schema({
  txntype: {
    type: String,    // Dr or Cr
    required: true
  },
  txnref: {
    type: String // Booking id
  },
  txndate: Date,
  cardnumber: String,
  customerid: {
    type: mongoose.Schema.Types.ObjectId, refPath: "onModel", autopopulate: { maxDepth: 2 }
  },
  onModel: {
    type: String,
    enum: [ 'Member', 'Enquiry', 'User', 'Prospect', "Vendor" ]
  },
  value: {
    type: Number, // Points
    required: true
  },
  billid: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Bill', autopopulate: { maxDepth: 2 }
  },
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
}, { versionKey: false, timestamps : true });

WallettxnSchema.plugin(mongooseautopopulate);

WallettxnSchema.options.selectPopulatedPaths = false;

var options = {customCollectionName: "histories", diffOnly: true, metadata: [{key: 'schemaname', value: 'wallettxns'} ]}

WallettxnSchema.plugin(mongooseHistory, options)


WallettxnSchema.pre("save", function (next, req) {

  if (this.customerid && this.onModel == "Member") {

    Member.findById(this.customerid._id).then((member) =>{
      if (!member.walletnumber) {
        member.walletnumber = member.membernumber;
        member.save(req).then();
      }

    });

  }
  else if (this.customerid && this.onModel == "Prospect") {

    Prospect.findById(this.customerid._id).then((prospect) =>{
      if (!prospect.walletnumber) {
        prospect.walletnumber = prospect.property.mobile;
        prospect.save(req).then();
      }

    });

  }

  next();
});

WallettxnSchema.statics = {


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
      .then((wallettxns) => {
        return wallettxns;
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
      .then((wallettxns) => {
        return wallettxns;
      })

  }


};

module.exports = mongoose.model('Wallettxn', WallettxnSchema);
