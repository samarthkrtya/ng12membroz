const mongoose = require('mongoose');
const mongooseHistory = require('../lib/mongoose-history');
const mongooseautopopulate = require('mongoose-autopopulate');
const mongooseLeanVirtuals = require('mongoose-lean-virtuals');
const common = require('../helpers/common');
var Float = require('mongoose-float').loadType(mongoose);
const BookingSchema = new mongoose.Schema({
  prefix: {
    type: String
  },
  bookingnumber: {
    type: Number
  },
  customerid: {
    type: mongoose.Schema.Types.ObjectId, refPath: "onModel", autopopulate: { maxDepth: 2 }
  },

  onModel: {
    type: String,
    enum: [ 'Member', 'Enquiry', 'User', 'Prospect' ]
  },
  bookingdate: {
    type: Date,
    default: Date.now
  },
  checkin: {
    type: Date,
    required: true
  },
  checkout: {
    type: Date,
  },
  quantity: { type: Number, default: 1 },
  eventid: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Event',
    autopopulate: { maxDepth: 3 }
  },
  locationid: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Resortlocation',
    autopopulate: { maxDepth: 2 }
  },
  resortid: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Resort',
    autopopulate: { maxDepth: 2 }
  },
  bookingdetail:
  {
    occupants:[{
      itemid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Billitem',
        autopopulate: { maxDepth: 2 }
      },
      occupanttype : String,
      adults:Number,
      childrens: Number,
      quantity: Number,
      discount: Float,
      cost: Float,
      totalcost: Float,
    }],
    totalrooms: Number,
    totaladults: Number,
    totalchildrens: Number,
    totalnights: Number
  },
  billid: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Bill', autopopulate: { maxDepth: 2 }
  },
  branchid: {type: mongoose.Schema.Types.ObjectId, ref: 'Branch'},
  addedby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  property: Object,
  status: { type: String, default: "requested" }
}, {
  versionKey: false,
  timestamps: true
});

BookingSchema.plugin(mongooseautopopulate);

BookingSchema.options.selectPopulatedPaths = false;

var options = {customCollectionName: "histories", diffOnly: true, metadata: [{key: 'schemaname', value: 'bookings'} ]}

BookingSchema.plugin(mongooseHistory, options)

BookingSchema.plugin(mongooseLeanVirtuals);

BookingSchema.virtual('docnumber').
  get(function() {
    return `${this.prefix}-${this.bookingnumber}`;
  })

BookingSchema.statics = {


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
      .catch((e) => console.log(e));
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
    fields["bookingnumber"] = 1
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
      .then((bookings) => {
        //console.log(bookings)
        return bookings;
      })

  },

  findcount(req) {

    var params = req.body;
    var size = parseInt(params.size);
    var query = common.generatequery(params);
    return this.countDocuments(query).exec().then((totalCount) => {
      var totalPages = Math.ceil(totalCount / size)
      req.header = { "error": false, "totalCount": totalCount, "totalPages": totalPages };
    })

  },

  exportdata(params) {

    var query = common.generatequery(params);
    var fields = common.generateselect(params.select);
    var sort = params.sort;
    if (!sort) {
      sort = {
        "updatedAt": -1,
        "createdAt": -1
      }
    }

    return this.find(query)
      .select(fields)
      .sort(sort)
      .lean({ virtuals: true, autopopulate: { maxDepth: 2 } })
      .exec()
      .then((bookings) => {
        return bookings;
      })

  }

};

module.exports = mongoose.model('Booking', BookingSchema);
