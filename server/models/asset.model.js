const mongoose = require('mongoose');
const mongooseHistory = require('../lib/mongoose-history');
const mongooseautopopulate = require('mongoose-autopopulate');
const common = require('../helpers/common');

const AssetSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  quantity: Number,
  unitdetail: [
    {
      number: Number,
      title: String
    }
  ],
  description: String,
  category:  {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Formdata',
    autopopulate: true
  },
  resortid:  {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resort',
    autopopulate: { maxDepth: 2 }
  },
  customerid:  { /// For Workshop and Renting
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'onCustomerModel',
    autopopulate: { maxDepth: 1 }
  },
  onCustomerModel: {
    type: String,
    enum: ['Member', 'Enquiry', 'User', 'Prospect']
  },
  bookingtype: String, //DAILY, HOURLY
  duration: Number, //MIN
  charges: Number,
  advancecharges: [{
    days: String,
    charges: Number,
  }],
  availability: {
    days: [],
    starttime: String,
    endtime: String,
    notavailibility : Boolean
  },
  advanceavailability: [{
    days: String,
    starttime: String,
    endtime: String
  }],
  breaktime: [{
    title: String,
    days: [],
    starttime: String,
    endtime: String
  }],
  taxes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tax',
    autopopulate: { maxDepth: 1 }
  }],
  gallery: [],
  property: Object,
  branchid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch'
  },
  addedby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  profilepic: String,
  wfstatus: String,
  wfreviewers: Object,
  wfrapprovers: Object,
  status: { type: String, default: "active" }
}, {
  versionKey: false,
  timestamps: true
});

AssetSchema.plugin(mongooseautopopulate);

AssetSchema.options.selectPopulatedPaths = false;

var options = {customCollectionName: "histories", diffOnly: true, metadata: [{key: 'schemaname', value: 'assets'} ]}

AssetSchema.plugin(mongooseHistory, options)


AssetSchema.statics = {


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
    fields["onCustomerModel"] = 1
    return this.find(query)
      .select(fields)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean({ virtuals: true, autopopulate: { maxDepth: 2 } })
      .exec()
      .then((assets) => {
        return assets;
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
      .then((assets) => {
        return assets;
      })

  }

};

module.exports = mongoose.model('Asset', AssetSchema);
