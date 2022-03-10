import mongooseHistory from '../lib/mongoose-history';

const mongoose = require('mongoose');
const mongooseautopopulate = require('mongoose-autopopulate');
const mongooseLeanVirtuals = require('mongoose-lean-virtuals');
const common = require('../helpers/common');

const AppointmentSchema = new mongoose.Schema({
  number: {
    type: Number
  },
  prefix : String,
  appointmentdate: {
    type: Date,
    required: true
  },
  attendee: {
    type: mongoose.Schema.Types.ObjectId, refPath: 'onModel', autopopulate: { maxDepth: 2 }
  },
  onModel: {
    type: String,
    enum: ['Member', 'Enquiry', 'User', 'Prospect', 'Groupclass', 'Asset']
  },
  host: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User', autopopulate: { maxDepth: 2 }
  },
  refid: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Service', autopopulate: { maxDepth: 2 }
  },
  resourceids: [
    {
      id: { type: mongoose.Schema.Types.ObjectId, refPath: 'resourceids.onModel', autopopulate: { maxDepth: 1 } },
      onModel: {
        type: String,
        required: true,
        enum: ['Asset', 'Billitem']
      },
      product: Boolean,
      quantity: Number
    }
  ],
  packageid: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Membership', autopopulate: { maxDepth: 1 }
  },
  eventid: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Event', autopopulate: { maxDepth: 2 }
  },
  timeslot: {
    day: String,
    starttime: String,
    endtime: String
  },
  charges : Number,
  deposits : Object,
  property: Object,
  billid: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Bill', autopopulate: { maxDepth: 2 }
  },
  branchid: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Branch'
  },
  addedby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: { type: String, default: "requested" }
}, {
  versionKey: false,
  timestamps: true
});

AppointmentSchema.plugin(mongooseautopopulate);

AppointmentSchema.options.selectPopulatedPaths = false;

var options = {customCollectionName: "histories", diffOnly: true, metadata: [{key: 'schemaname', value: 'appointments'} ]}

AppointmentSchema.plugin(mongooseHistory, options)

AppointmentSchema.plugin(mongooseLeanVirtuals);

AppointmentSchema.virtual('docnumber').
  get(function() {
    return `${this.prefix}-${this.number}`;
  })

AppointmentSchema.statics = {

  getnextdocnumber(prefix, branchid) {

    var query = {};
    query["prefix"] = prefix;
    query["status"] = { "$ne": "deleted" };
    if (DATABASETYPE =="branchwise")
    {
      query["branchid"] = branchid;
    }

    return this.findOne(query)
      .select({ number: 1, _id: 0 })
      .sort({ number: -1 })
      .then(num => {
        var nextnum = 0;
        if (!num) {
          nextnum = 1;
        }
        if (num && num.number) {
          nextnum = num.number + 1;
        }
        return nextnum;
      })
  },

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

    fields["prefix"] = 1
    fields["number"] = 1
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
      .then((appointments) => {
        return appointments;
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
      .then((appointments) => {
        return appointments;
      })

  }

};

module.exports = mongoose.model('Appointment', AppointmentSchema);
