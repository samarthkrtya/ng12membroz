const mongoose = require('mongoose');
const mongooseHistory = require('../lib/mongoose-history');
const common = require('../helpers/common');
const mongooseautopopulate = require('mongoose-autopopulate');
var Float = require('mongoose-float').loadType(mongoose);

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Formdata',
    autopopulate: { maxDepth: 2 }
  },
  tickets: [{
    itemid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Billitem',
      autopopulate: { maxDepth: 2 }
    },
    noofperson: Number,
    cost: Float,
    taxes : [{type: mongoose.Schema.Types.ObjectId, ref: 'Tax', autopopulate: { maxDepth: 1 }}],
    tickettype: String
  }],  
  groupid: {type: mongoose.Schema.Types.ObjectId, ref: 'Groupclass', autopopulate: { maxDepth: 2 }},
  attendeeids: [
    {type: mongoose.Schema.Types.ObjectId, ref: 'Contactview', autopopulate: { maxDepth: 1 }}    
  ],
  invitees: {
    prospects :  [{type: mongoose.Schema.Types.ObjectId, ref: 'Prospect', autopopulate: { maxDepth: 2 }}],
    members :  [{type: mongoose.Schema.Types.ObjectId, ref: 'Member', autopopulate: { maxDepth: 2 }}],
  },
  attendees: {
    prospects :  [{type: mongoose.Schema.Types.ObjectId, ref: 'Prospect', autopopulate: { maxDepth: 2 }}],
    members :  [{type: mongoose.Schema.Types.ObjectId, ref: 'Member', autopopulate: { maxDepth: 2 }}],
  },
  branchid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch'
  },
  addedby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: { type: String, default: "active" },
  property: Object,
}, {
  versionKey: false,
  timestamps: true
});

EventSchema.plugin(mongooseautopopulate);

EventSchema.options.selectPopulatedPaths = false;

var options = {customCollectionName: "histories", diffOnly: true, metadata: [{key: 'schemaname', value: 'events'} ]}

EventSchema.plugin(mongooseHistory, options)

EventSchema.statics = {


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
      .then((events) => {
        return events;
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
      .then((events) => {
        return events;
      })

  }


}

module.exports = mongoose.model('Event', EventSchema);
