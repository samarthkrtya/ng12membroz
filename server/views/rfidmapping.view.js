const mongoose = require('mongoose');
const mongooseautopopulate = require('mongoose-autopopulate');
const common = require('../helpers/common');

const RfidmappingviewSchema = new mongoose.Schema({
  fullname: String,
  property: Object,
  branchid: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch'}
}, {
  versionKey: false
});

RfidmappingviewSchema.plugin(mongooseautopopulate);

RfidmappingviewSchema.options.selectPopulatedPaths = false;

RfidmappingviewSchema.statics = {

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

module.exports = mongoose.model('Rfidmappingview', RfidmappingviewSchema);
