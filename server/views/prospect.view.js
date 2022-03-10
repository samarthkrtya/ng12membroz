const mongoose = require('mongoose');
const mongooseautopopulate = require('mongoose-autopopulate');
const common = require('../helpers/common');

const ProspectviewSchema = new mongoose.Schema({
  profilepic: String,
  fullname: String,
  stage: { type: String, default: "Fresh" },
  attachments: [],
  handlerid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    autopopulate: { maxDepth: 2 }
  },
  campaignid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    autopopulate: { maxDepth: 2 }
  },
  openactivity: [
    {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Activity",
        autopopulate: { maxDepth: 2 }
      }
    }
  ],
  closeactivity: [
    {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Activity",
        autopopulate: { maxDepth: 2 }
      }
    }
  ],
  bookings: [
    {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking",
        autopopulate: { maxDepth: 2 }
      }
    }
  ],
  appointments: [{
      refid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
        autopopulate: { maxDepth: 2 }
      }
    }
  ],
  facilitybookings: [
    {
      refid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Asset",
        autopopulate: { maxDepth: 2 }
      }
    }
  ],
  addons: [
    {
      membershipid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Membership",
        autopopulate: { maxDepth: 2 }
      },
      paymentterms: [
        { type: mongoose.Schema.Types.ObjectId, ref: "Paymentterm", autopopulate: { maxDepth: 3 } },
      ],
      membershipstart: Date,
      membershipend: Date,
    },
  ],
  payments: [
    {
      item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Paymentschedule',
        autopopulate: { maxDepth: 3 }
      }
    }
  ],
  paymentinvoices: [
    {
      paymentterms: [
        { type: mongoose.Schema.Types.ObjectId, ref: "Paymentterm", autopopulate: { maxDepth: 2 } },
      ]
    }
  ],
  branchid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch"
  },
  memberid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Member"
  },
  addedby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  property: Object,
  status: { type: String, default: "active" },
}, {
  versionKey: false
});

ProspectviewSchema.plugin(mongooseautopopulate);

ProspectviewSchema.options.selectPopulatedPaths = false;

ProspectviewSchema.statics = {

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
      .then((members) => {
        return members;
      })

  },


};

module.exports = mongoose.model('Prospectview', ProspectviewSchema);
