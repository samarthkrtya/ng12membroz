const mongoose = require('mongoose');
const mongooseHistory = require('../lib/mongoose-history');
const mongooseautopopulate = require('mongoose-autopopulate');
const common = require('../helpers/common');

const SaleschannelteamSchema = new mongoose.Schema({
  salesteamname: {
    type: String,
    required: true
  },
  saleschannelid: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Saleschannel',
    required: true,
    autopopulate: { maxDepth: 2 }
  },
  teamhead: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User',
    autopopulate: { maxDepth: 2 }
  },
  channels: [
    {
      userid: { type: mongoose.Schema.Types.ObjectId, ref: 'User', autopopulate: { maxDepth: 2 } },
      head: { type: mongoose.Schema.Types.ObjectId, ref: 'User', autopopulate: { maxDepth: 2 } },
      designationid: { type: mongoose.Schema.Types.ObjectId, ref: 'Designation', autopopulate: { maxDepth: 2 } }
    }
  ],
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

SaleschannelteamSchema.plugin(mongooseautopopulate);

SaleschannelteamSchema.options.selectPopulatedPaths = false;

var options = {customCollectionName: "histories", diffOnly: true, metadata: [{key: 'schemaname', value: 'Saleschannelteams'} ]}

SaleschannelteamSchema.plugin(mongooseHistory, options)


SaleschannelteamSchema.statics = {


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
      .then((Saleschannelteams) => {
        return Saleschannelteams;
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
      .then((Saleschannelteams) => {
        return Saleschannelteams;
      })

  }


};

module.exports = mongoose.model('Saleschannelteam', SaleschannelteamSchema);
