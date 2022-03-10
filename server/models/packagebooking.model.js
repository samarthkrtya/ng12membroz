const mongoose = require('mongoose');
const mongooseHistory = require('../lib/mongoose-history');
const mongooseautopopulate = require('mongoose-autopopulate');
const mongooseLeanVirtuals = require('mongoose-lean-virtuals');
const common = require('../helpers/common');
var Float = require('mongoose-float').loadType(mongoose);

const PackagebookingSchema = new mongoose.Schema({
  prefix: {
    type: String
  },
  tournumber: {
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
  traveldate: {
    type: Date,
  },
  package: {
    type: mongoose.Schema.Types.ObjectId, ref : "Tourpackage", autopopulate: { maxDepth: 2 }
  },
  charges: Number,
  discount: { type: Number, default: 0 },
  quantity: { type: Number, default: 1 },
  totaladults: Number,
  totalchildrens: Number,
  itemid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Billitem',
    autopopulate: { maxDepth: 2 }
  },
  destinations:[
    {
      destination: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resortlocation',
        autopopulate: { maxDepth: 1 }
      },
      day: String,
      resortid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resort',
        autopopulate: { maxDepth: 1 }
      },
      checkin: Date,
      checkout: Date,
      nights: String,
      totalrooms: Number,
      occupants:[{
        itemid: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Billitem',
          autopopulate: { maxDepth: 2 }
        },
        roomtype : String,
        includes: [String],
        adults:Number,
        childrens: Number,
        quantity: Number,
        discount: { type: Float, default: 0 },
        cost: Float
      }]
    }
  ],
  activity:[
    {
      event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        autopopulate: { maxDepth: 1 }
      },
      itemid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Billitem',
        autopopulate: { maxDepth: 2 }
      },
      location : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resortlocation',
        autopopulate: { maxDepth: 1 }
      },
      date: Date,
      day: String,
      description: String,
      duration: String,
      includes: [String],
      quantity: Number,
      discount: { type: Float, default: 0 },
      cost: Float
    }
  ],
  transfer:[
    {
      from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resortlocation',
        autopopulate: { maxDepth: 1 }
      },
      to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resortlocation',
        autopopulate: { maxDepth: 1 }
      },
      itemid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Billitem',
        autopopulate: { maxDepth: 2 }
      },
      day: String,
      date: Date,
      transfertype: String,
      duration: String,
      quantity: Number,
      discount: { type: Float, default: 0 },
      cost: Float,
      nightscover : { type : Boolean , default : false },
      facilities: []
    }
  ],
  flight:[
    {
      from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resortlocation',
        autopopulate: { maxDepth: 1 }
      },
      to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resortlocation',
        autopopulate: { maxDepth: 1 }
      },
      itemid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Billitem',
        autopopulate: { maxDepth: 2 }
      },
      day: String,
      date: Date,
      duration: String,
      quantity: Number,
      discount: { type: Float, default: 0 },
      cost: Float,
      nightscover : { type : Boolean , default : false },
      tickettype : String,
    }
  ],
  billid: { type: mongoose.Schema.Types.ObjectId, ref: 'Bill', autopopulate: { maxDepth: 2 } },
  branchid: {type: mongoose.Schema.Types.ObjectId, ref: 'Branch'},
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

PackagebookingSchema.plugin(mongooseautopopulate);

PackagebookingSchema.options.selectPopulatedPaths = false;

var options = {customCollectionName: "histories", diffOnly: true, metadata: [{key: 'schemaname', value: 'packagebookings'} ]}

PackagebookingSchema.plugin(mongooseHistory, options)

PackagebookingSchema.plugin(mongooseLeanVirtuals);

PackagebookingSchema.virtual('docnumber').
  get(function() {
    return `${this.prefix}-${this.tournumber}`;
  })

PackagebookingSchema.statics = {


  getnextdocnumber(prefix, branchid) {

    var query = {};
    query["prefix"] = prefix;
    query["status"] = { "$ne": "deleted" };
    if (DATABASETYPE =="branchwise")
    {
      query["branchid"] = branchid;
    }

    return this.findOne(query)
      .select({ tournumber: 1, _id: 0 })
      .sort({ tournumber: -1 })
      .then(num => {
        var nextnum = 0;
        if (!num) {
          nextnum = 1;
        }
        if (num && num.tournumber) {
          nextnum = num.tournumber + 1;
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
    fields["tournumber"] = 1
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
      .then((packagebookings) => {
        return packagebookings;
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
      .then((packagebookings) => {
        return packagebookings;
      })

  }

};

module.exports = mongoose.model('Packagebooking', PackagebookingSchema);
