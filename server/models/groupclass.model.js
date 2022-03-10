const mongoose = require('mongoose');
const mongooseHistory = require('../lib/mongoose-history');
const mongooseautopopulate = require('mongoose-autopopulate');
const common = require('../helpers/common');

const GroupclassSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  assigneeuser: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User'
  },
  members: [
    {
      memberid: {
        type: mongoose.Schema.Types.ObjectId, refPath: 'members.onModel', autopopulate: { maxDepth: 2 }
      },
      onModel: {
        type: String,
        enum: ['Member', 'Prospect']
      }
    }
  ],
  waitings: [
    {
      memberid: {
        type: mongoose.Schema.Types.ObjectId, refPath: 'waitings.onModel', autopopulate: { maxDepth: 1 }
      },
      onModel: {
        type: String,
        enum: ['Member', 'Prospect']
      }
    }
  ],
  filter: Object,
  branchid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch'
  },
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

GroupclassSchema.plugin(mongooseautopopulate);

GroupclassSchema.options.selectPopulatedPaths = false;

var options = {customCollectionName: "histories", diffOnly: true, metadata: [{key: 'schemaname', value: 'groupclasses'} ]}

GroupclassSchema.plugin(mongooseHistory, options)


GroupclassSchema.statics = {


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
      .then((groupclasses) => {
        return groupclasses;
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
      .then((groupclasses) => {
        return groupclasses;
      })

  }


};

module.exports = mongoose.model('Groupclass', GroupclassSchema);
