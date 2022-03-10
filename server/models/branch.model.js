const mongoose = require('mongoose');
const mongooseHistory = require('../lib/mongoose-history');
const mongooseautopopulate = require('mongoose-autopopulate');


const BranchSchema = new mongoose.Schema({
  branchname: {
    type: String,
    required: true
  },
  branchlogo: String,
  startingusernumber: String,
  startingnumber: String,
  billingemail: String,
  supportemail: String,
  supportnumber: String,
  currency: String,
  docformat: Object,
  workinghours: { starttime: String, endtime: String, days: [] },
  breaktime: [{
    title: String,
    days: [],
    starttime: String,
    endtime: String
  }],
  solutiontype: String,
  iswalletenable: Boolean,
  isqrenable: Boolean,
  qrcode: String,
  iswebqrenable: Boolean,
  webqrcode: String,
  vatnumber: String,
  companyphone: String,
  contactperson: String,
  address: String,
  postcode: String,
  city: String,
  state: String,
  country: String,
  timezone: String,
  locale: String,
  loyalitysettings: Object,
  property: Object,
  cancellationpolicy: Object,
  appointmentsetting: Object,
  paymentsetting: Object,
  license: {
    users: Number,
    members: Number
  },
  paymentmethods: [
    {
      cctype: String,
      number: Number,
      expiry: Date,
      csv: Number,
      default: Boolean,
      status: String,
      holdername: String
    },
  ],
  membrozid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    autopopulate: { maxDepth: 1 }
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

BranchSchema.plugin(mongooseautopopulate);

BranchSchema.options.selectPopulatedPaths = false;

var options = { customCollectionName: "histories", diffOnly: true, metadata: [{ key: 'schemaname', value: 'branches' }] }

BranchSchema.plugin(mongooseHistory, options)

BranchSchema.statics = {


  getbyfilter(params) {

    const common = require('../helpers/common');
    ////console.log("params", params)
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
      .then((branches) => {
        return branches;
      })
      .catch((e) => console.log(e))

  },

  findcount(req) {
    const common = require('../helpers/common');
    var params = req.body;
    var size = parseInt(params.size);
    var query = common.generatequery(params);
    return this.countDocuments(query).exec().then((totalCount) => {
      var totalPages = Math.ceil(totalCount / size)
      req.header = { "error": false, "totalCount": totalCount, "totalPages": totalPages };
    })

  },

  exportdata(params) {
    const common = require('../helpers/common');
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
      .then((branches) => {
        return branches;
      })

  }

};

module.exports = mongoose.model('Branch', BranchSchema);
