const mongoose = require('mongoose');
const mongooseautopopulate = require('mongoose-autopopulate');
const common = require('../helpers/common');


const InspectionviewSchema = new mongoose.Schema({
  customername: {
    type: String,
  },
  customerid: {
    type: mongoose.Schema.Types.ObjectId,
  },
  vehiclename: {
    type: String,
  },
  inspectionby: {
    type: String,
  },
  assetid: {
    type: mongoose.Schema.Types.ObjectId,
  },
  jobordernumber: {
    type: String,
  },
  joborderid: {
    type: mongoose.Schema.Types.ObjectId,
  },
  date: {
      type: Date
  },
  branchid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch'
  },
  addedby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  property: Object,
  status: { type: String, default: "active" }
}, {
  versionKey: false
});

InspectionviewSchema.plugin(mongooseautopopulate);

InspectionviewSchema.options.selectPopulatedPaths = false;

InspectionviewSchema.statics = {


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

    // console.log("query", query);
    
    return this.find(query)
    .select(fields)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean({ virtuals: true, autopopulate: { maxDepth: 2 } })
      .exec()
      .then((inspections) => {
        console.log("inspections", inspections)
        return inspections;
      })
      .catch((e) => console.log(e))

  },


};

module.exports = mongoose.model('Inspectionview', InspectionviewSchema, 'inspectionviews');
