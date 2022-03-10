const mongoose = require('mongoose');
const mongooseautopopulate = require('mongoose-autopopulate');
const common = require('../helpers/common');

const MemberviewSchema = new mongoose.Schema({
  membernumber: {
    type: String,
    required: true,
  },
  membershipid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Membership",
    autopopulate: { maxDepth: 2 }
  },
  membershipstart: {
    type: Date,
  },
  membershipend: Date,
  profilepic: String,
  fullname: String,
  attachments: [],
  paymentterms: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Paymentterm", autopopulate: { maxDepth: 2 } },
  ],
  addons: [
    {
      membershipid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Membership",
        autopopulate: { maxDepth: 2 }
      },
      paymentterms: [
        { type: mongoose.Schema.Types.ObjectId, ref: "Paymentterm", autopopulate: { maxDepth: 2 } },
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
  openactivity: [
    {
      dispositionid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Disposition',
        autopopulate: { maxDepth: 2 }
      },
      assingeeuser: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", autopopulate: { maxDepth: 2 } }]
    }
  ],
  closeactivity: [
    {
      dispositionid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Disposition',
        autopopulate: { maxDepth: 2 }
      },
      assingeeuser: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", autopopulate: { maxDepth: 2 } }]
    }

  ],
  bookings: [
  ],
  dynamicforms: [
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
  membershipusages: [{
    refid: { type: mongoose.Schema.Types.ObjectId, refPath: 'membershipusages.onModel', autopopulate: { maxDepth: 1 } },
    onModel: {
      type: String,
      enum: ['Billitem', 'Service', 'Asset']
    }
  }],
  paidamount: Number,
  dueamount: Number,
  walletbalance: Number,
  branchid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch"
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

MemberviewSchema.plugin(mongooseautopopulate);

MemberviewSchema.options.selectPopulatedPaths = false;

MemberviewSchema.statics = {

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

module.exports = mongoose.model('Memberview', MemberviewSchema);
