import mongooseHistory from '../lib/mongoose-history';

const mongoose = require('mongoose');
const mongooseautopopulate = require('mongoose-autopopulate');
const mongooseLeanVirtuals = require('mongoose-lean-virtuals');
const common = require('../helpers/common');

const FacilitybookingSchema = new mongoose.Schema({
  prefix: {
    type: String
  },
  bookingnumber: {
    type: Number
  },
  bookingdate: {
    type: Date,
    required: true
  },
  checkin: {
    type: Date,
  },
  checkout: {
    type: Date,
  },
  customerid: {
    type: mongoose.Schema.Types.ObjectId, refPath: 'onModel', autopopulate: { maxDepth: 2 }
  },
  onModel: {
    type: String,
    enum: ['Member', 'Enquiry', 'User', 'Prospect']
  },
  refid: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Asset', autopopulate: { maxDepth: 2 }
  },
  timeslot: {
    day: String,
    starttime: String,
    endtime: String
  },
  quantity: { type: Number, default: 1 },
  bookingdetail:
  {
    occupants:[{
      room: Number,
      adults:Number,
      childrens: Number,
      extrabed: Number,
      extracost: Number
    }],
    totalrooms: {
      type: Number,
    },
    quantity: {
      type: Number,
    },
    bookingcost: {
      type: Number
    },
    totalrooms: {
      type: Number
    },
    totaladults: {
      type: Number
    },
    totalchildrens: {
      type: Number
    },
  },
  charges : Number,
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

FacilitybookingSchema.plugin(mongooseautopopulate);

FacilitybookingSchema.options.selectPopulatedPaths = false;

var options = {customCollectionName: "histories", diffOnly: true, metadata: [{key: 'schemaname', value: 'facilitybookings'} ]}

FacilitybookingSchema.plugin(mongooseHistory, options)

FacilitybookingSchema.plugin(mongooseLeanVirtuals);

FacilitybookingSchema.virtual('docnumber').
  get(function() {
    return `${this.prefix}-${this.bookingnumber}`;
  })

FacilitybookingSchema.statics = {

  getnextdocnumber(prefix, branchid) {

    var query = {};
    query["prefix"] = prefix;
    query["status"] = { "$ne": "deleted" };
    if (DATABASETYPE =="branchwise")
    {
      query["branchid"] = branchid;
    }

    return this.findOne(query)
      .select({ bookingnumber: 1, _id: 0 })
      .sort({ bookingnumber: -1 })
      .then(num => {
        var nextnum = 0;
        if (!num) {
          nextnum = 1;
        }
        if (num && num.bookingnumber) {
          nextnum = num.bookingnumber + 1;
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

    skip = size * (pageNo - 1)
    limit = size;
    if (params.searchtext && !Array.isArray(params.searchtext)) {
      skip = 0;
      limit = 0;
    }
    fields["prefix"] = 1
    fields["bookingnumber"] = 1
    fields["onModel"] = 1

    return this.find(query)
    .select(fields)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean({ virtuals: true, autopopulate: { maxDepth: 2 } })
      .exec()
      .then((facilitybookings) => {
        return facilitybookings;
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

};

module.exports = mongoose.model('Facilitybooking', FacilitybookingSchema);
