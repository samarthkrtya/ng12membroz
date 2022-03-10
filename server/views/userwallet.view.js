const mongoose = require('mongoose');
const mongooseautopopulate = require('mongoose-autopopulate');
const common = require('../helpers/common');

const UserwalletSchema = new mongoose.Schema({
  fullname: String,
  membernumber: String,
  wallet: Object
}, {
  versionKey: false
});

UserwalletSchema.plugin(mongooseautopopulate);

UserwalletSchema.options.selectPopulatedPaths = false;

UserwalletSchema.statics = {

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
      .then((wallets) => {
        return wallets;
      })

  },


};

module.exports = mongoose.model('Userwalletview', UserwalletSchema);
