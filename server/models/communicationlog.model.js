const mongoose = require('mongoose');
const mongooseautopopulate = require('mongoose-autopopulate');

const CommunicationlogSchema = new mongoose.Schema({
  messagetype: String, // SMS, EMAIL, WHATSAPP, ALERTS
  communicationid: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Communication',
    autopopulate: { maxDepth: 2 }
  },
  address: String,
  receivers: [{
    type: mongoose.Schema.Types.ObjectId
  }],
  property: Object,
  branchid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch"
  },
  status: { type: String, default: "active" },
}, {
  versionKey: false,
  timestamps: true
});

CommunicationlogSchema.plugin(mongooseautopopulate);

CommunicationlogSchema.options.selectPopulatedPaths = false;

CommunicationlogSchema.statics = {


  getbyfilter(params) {

    const common = require('../helpers/common');

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
      .then((communications) => {
        return communications;
      })

  },

  findcount(req) {

    const common = require('../helpers/common');
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
      .then((communications) => {
        return communications;
      })

  }


};

module.exports = mongoose.model('Communicationlog', CommunicationlogSchema);
