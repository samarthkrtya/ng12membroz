const mongoose = require('mongoose');
const common = require('../helpers/common');

const HolidayeventviewSchema = new mongoose.Schema({
  fullname:String,
  designation: String,
  designationid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Designation"
  },
  checkin: Date,
  checkout: Date,
  branchid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch"
  }
}, {
  versionKey: false
});

HolidayeventviewSchema.statics = {

  filterview(params) {

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
      .then((holidayevents) => {
        return holidayevents;
      })

  },


};

module.exports = mongoose.model('Holidayeventviews', HolidayeventviewSchema);
