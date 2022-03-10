const mongoose = require('mongoose');
const mongooseHistory = require('../lib/mongoose-history');
const mongooseautopopulate = require('mongoose-autopopulate');
const mongooseLeanVirtuals = require('mongoose-lean-virtuals');
var Float = require('mongoose-float').loadType(mongoose);
const common = require('../helpers/common');

const BillSchema = new mongoose.Schema({
  prefix: String,
  billnumber: {
    type: Number,
    required: true
  },
  customerid: {
    type: mongoose.Schema.Types.ObjectId, refPath: "onModel", autopopulate: { maxDepth: 2 }, required: true
  },
  eventid: {
    type: mongoose.Schema.Types.ObjectId, ref: "Event", autopopulate: { maxDepth: 1 }
  },
  onModel: {
    type: String,
    required: true,
    enum: ['Member', 'Enquiry', 'User', 'Prospect']
  },
  bookings: [{
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Billitem', autopopulate: { maxDepth: 2 } },
    refid: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "onModelBooking",
      autopopulate: { maxDepth: 1 }
    },
    onModelBooking: {
      type: String,
      required: true,
      enum: ['Booking', 'Packagebooking']
    },
    quantity: Number,
    taxes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tax', autopopulate: { maxDepth: 1 } }],
    discount: Float,
    rate: Float,
    cost: Float,
    taxamount: Float,
    totalcost: Float
  }],
  items: [{
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Billitem', autopopulate: { maxDepth: 2 } },
    quantity: Number,
    taxes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tax', autopopulate: { maxDepth: 2 } }],
    couponcode: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon', autopopulate: { maxDepth: 1 } },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', autopopulate: { maxDepth: 1 } },
    coupondiscount: Float,
    discount: Float,
    rate: Float,
    cost: Float,
    taxamount: Float,
    totalcost: Float,
    qrcode : String,
    itemnumber : String,
    to: String,
    used: Boolean,
    valid: Date,
  }], // { itemname: "Breakfast", qty: 1, cost: 500, tax: 18, totalcost: 500 }
  services: [{
    appointmentid: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', autopopulate: { maxDepth: 1 } },
    refid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      autopopulate: { maxDepth: 2 }
    },
    timeslot: {
      day: String,
      starttime: String,
      endtime: String
    },
    host: {
      type: mongoose.Schema.Types.ObjectId, ref: 'User', autopopulate: { maxDepth: 2 }
    },
    appointmentdate: {
      type: Date
    },
    amount: Float,
    taxes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tax', autopopulate: { maxDepth: 1 } }],
    couponcode: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon', autopopulate: { maxDepth: 1 } },
    deposit: Float,
    coupondiscount: Float,
    discount: Float,
    isoverridediscount: { type: Boolean, default: false },
    rate: Float,
    cost: Float,
    taxamount: Float,
    totalcost: Float,
    status: String
  }],
  assets: [{
    bookingid: { type: mongoose.Schema.Types.ObjectId, ref: 'Facilitybooking', autopopulate: { maxDepth: 2 } },
    refid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Asset",
      autopopulate: { maxDepth: 2 }
    },
    bookingdate: {
      type: Date,
      required: true
    },
    timeslot: {
      day: String,
      starttime: String,
      endtime: String
    },
    amount: Float, 
    quantity: Number,
    taxes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tax', autopopulate: { maxDepth: 1 } }],
    couponcode: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon', autopopulate: { maxDepth: 1 } },
    coupondiscount: Float,
    discount: Float,
    rate: Float,
    cost: Float,
    taxamount: Float,
    totalcost: Float,
    status: String
  }],
  packages: [{
    packageid: { type: mongoose.Schema.Types.ObjectId, ref: 'Membership', autopopulate: { maxDepth: 2 } },
    bookingids: [
      {
        bookingid: { type: mongoose.Schema.Types.ObjectId, refPath: 'packages.bookingids.onModel', autopopulate: { maxDepth: 2 } },
        onModel: {
          type: String,
          required: true,
          enum: ['Appointment', 'Facilitybooking']
        }
      }
    ],
    quantity: Number,
    taxes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tax', autopopulate: { maxDepth: 2 } }],
    couponcode: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon', autopopulate: { maxDepth: 1 } },
    discount: Float,
    rate: Float,
    cost: Float,
    taxamount: Float,
    totalcost: Float
  }],
  taxamount: {
    type: Float
  },
  taxdetail: {},
  totalamount: Float,
  amount: {
    type: Float,
    //required: true
  },
  paidamount: {
    type: Float,
    default: 0
  },
  creditamount: {
    type: Float,
    default: 0
  },
  billdate: Date,
  deposit: Float,
  duedate: Date,
  draccount: { type: mongoose.Schema.Types.ObjectId, ref: 'Accounthead', default: "5d5d4cfe93b7a12dfcfea7ae" },
  craccount: { type: mongoose.Schema.Types.ObjectId, ref: 'Accounthead', default: "5d5d4fda93b7a12dfcfea7ce" },
  discount: Float,
  balance: Float,
  outstandingamount: Float,
  couponamount: { type: Float, default: 0 },
  couponcode: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon', autopopulate: { maxDepth: 1 } },
  rounding: Float,
  type: String, // POS, servicefrontdesk, job order, rent, facility booking
  wfstatus: { type: String },
  branchid: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', autopopulate: { maxDepth: 2 } },
  addedby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  property: Object,
  status: { type: String, default: "Unpaid" }
}, {
  versionKey: false,
  timestamps: true
});

BillSchema.plugin(mongooseautopopulate);

BillSchema.options.selectPopulatedPaths = false;

var options = { customCollectionName: "histories", diffOnly: true, metadata: [{ key: 'schemaname', value: 'bills' }] }

BillSchema.plugin(mongooseHistory, options)

BillSchema.plugin(mongooseLeanVirtuals);

BillSchema.virtual('docnumber').
  get(function () {
    return `${this.prefix}-${this.billnumber}`;
  })

BillSchema.statics = {

  getnextdocnumber(prefix, branchid) {

    var query = {};
    query["prefix"] = prefix;
    query["status"] = { "$ne": "deleted" };
    if (DATABASETYPE == "branchwise") {
      query["branchid"] = branchid;
    }

    return this.findOne(query)
      .select({ billnumber: 1, _id: 0 })
      .sort({ billnumber: -1 })
      .then(num => {
        var nextnum = 0;
        if (!num) {
          nextnum = 1;
        }
        if (num && num.billnumber) {
          nextnum = num.billnumber + 1;
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
        "updatedAt": -1,
        "createdAt": -1
      }
    }

    if (pageNo < 0 || pageNo === 0) {
      return { "error": true, "message": "invalid page number, should start with 1" };
    }

    skip = size * (pageNo - 1)
    limit = size;
    fields["prefix"] = 1
    fields["billnumber"] = 1
    fields["onModel"] = 1
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
      .then((bills) => {
        return bills;
      })
      .catch((e) => console.log(e))

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
      .then((bills) => {
        return bills;
      })

  }

}

module.exports = mongoose.model('Bill', BillSchema);
