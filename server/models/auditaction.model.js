const { now } = require('jquery');
const mongoose = require('mongoose');
const common = require('../helpers/common');
const mongooseautopopulate = require('mongoose-autopopulate');

const AuditactionSchema = new mongoose.Schema({
  token: String, // Login, Logoff
  ip: { type: String },
  login: { type: Date, default: Date() },
  last: { type: Date, default: Date() },
  logout: { type: Date },
  addedby: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'onModel',
    autopopulate: { maxDepth: 1 }
  },
  onModel: {
    type: String,
    enum: ['Member', 'User'],
    default: "User"
  },
  branchid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    autopopulate: { maxDepth: 2 }
  },
},
  {
    versionKey: false,
    timestamps: false
  });

AuditactionSchema.plugin(mongooseautopopulate);

AuditactionSchema.options.selectPopulatedPaths = false;

AuditactionSchema.statics = {


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
      .then((designations) => {
        console.log("designations", designations)
        return designations;
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
      .then((designations) => {
        return designations;
      })

  }


}

module.exports = mongoose.model('Auditaction', AuditactionSchema);
