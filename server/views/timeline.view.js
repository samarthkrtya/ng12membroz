const mongoose = require('mongoose');
const common = require('../helpers/common');

const TimelineviewSchema = new mongoose.Schema({
  type: String,
  property: Object,
  receiver: mongoose.Schema.Types.ObjectId,
  branchid: mongoose.Schema.Types.ObjectId,
  subject: String,
  content: String
}, {
  versionKey: false
});

TimelineviewSchema.statics = {

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
      .then((timelines) => {
        return timelines;
      })

  },


};

module.exports = mongoose.model('Timelineview', TimelineviewSchema);
