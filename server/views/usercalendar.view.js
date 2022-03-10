const mongoose = require('mongoose');
const mongooseautopopulate = require('mongoose-autopopulate');
const common = require('../helpers/common');


const UsercalendarviewSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  type: {
    type: String,
  },
  customername: {
    type: String,
  },
  date: {
    type: Date,
  },
  branchid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch'
  },
  timeslot: Object,
  userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  property: Object,
  status: { type: String, default: "active" }
}, {
  versionKey: false
});

UsercalendarviewSchema.plugin(mongooseautopopulate);

UsercalendarviewSchema.options.selectPopulatedPaths = false;

UsercalendarviewSchema.statics = {


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
    return this.find(query)
      .select(fields)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean({ virtuals: true, autopopulate: { maxDepth: 2 } })
      .exec()
      .then((activities) => {
        return activities;
      })
      //.catch((e) => )

  },


};

module.exports = mongoose.model('Usercalendarview', UsercalendarviewSchema);
