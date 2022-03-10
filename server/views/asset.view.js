const mongoose = require('mongoose');
const mongooseautopopulate = require('mongoose-autopopulate');
const common = require('../helpers/common');

const AssetviewSchema = new mongoose.Schema({
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
    autopopulate: { maxDepth: 1 }
  },
  resortid:  {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resort',
    autopopulate: { maxDepth: 2 }
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
    endtime: String
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
  branchid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch'
  },
  property: Object,
  status: { type: String, default: "active" }
}, {
  versionKey: false
});


AssetviewSchema.plugin(mongooseautopopulate);

AssetviewSchema.options.selectPopulatedPaths = false;

AssetviewSchema.statics = {


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
    // console.log("query", query)
    return this.find(query)
    .select(fields)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean({ virtuals: true, autopopulate: { maxDepth: 2 } })
      .exec()
      .then((billitems) => {
        return billitems;
      })

  }

};

module.exports = mongoose.model('Assetview', AssetviewSchema);
