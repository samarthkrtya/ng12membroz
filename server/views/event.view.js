const mongoose = require('mongoose');
const common = require('../helpers/common');
const mongooseautopopulate = require('mongoose-autopopulate');
var Float = require('mongoose-float').loadType(mongoose);

const EventviewSchema = new mongoose.Schema({
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
  groupid: {
    members :  [{
      memberid : {type: mongoose.Schema.Types.ObjectId, refPath: 'groupid.members.onModel', autopopulate: { maxDepth: 2 }},
       onModel: {
       type: String,
        enum: ['Member', 'Prospect' ]
     },
  }]},
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
  schedulers : [
    {
      host: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        autopopulate: { maxDepth: 2 }
      }
    }
  ],
  bills : [],
  billpayments : [],
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

EventviewSchema.plugin(mongooseautopopulate);

EventviewSchema.options.selectPopulatedPaths = false;

EventviewSchema.statics = {


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
      .then((events) => {
        return events;
      })

  },

    


}

module.exports = mongoose.model('Eventview', EventviewSchema);
