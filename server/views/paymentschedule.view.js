const mongoose = require('mongoose');
const mongooseautopopulate = require('mongoose-autopopulate');
const common = require('../helpers/common');

const PaymentscheduleviewSchema = new mongoose.Schema({
  balance: Number,
  paidamount: Number,
  memberid: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', refPath: 'onModel', autopopulate: { maxDepth: 2 }},
  onModel: {
    type: String,
    default: 'Member',
    enum: [ 'Member', 'Prospect' ]
  },
  membershipid: { type: mongoose.Schema.Types.ObjectId, ref: 'Membership' , autopopulate: { maxDepth: 2 }},
  status: { type: String, default: "active" }
}, {
  versionKey: false
});

PaymentscheduleviewSchema.plugin(mongooseautopopulate);

PaymentscheduleviewSchema.options.selectPopulatedPaths = false;

PaymentscheduleviewSchema.statics = {

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
      .then((branches) => {
        return branches;
      })

  },


};

module.exports = mongoose.model('Paymentscheduleview', PaymentscheduleviewSchema);
