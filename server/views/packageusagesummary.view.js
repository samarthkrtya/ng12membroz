const mongoose = require('mongoose');
const mongooseautopopulate = require('mongoose-autopopulate');
const common = require('../helpers/common');
const PackageusagesummarySchema = new mongoose.Schema({
  membershipname: String,  facility: [
    {
      serviceid: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', autopopulate: { maxDepth: 1 } },
      discount: Number,
      visits: Number,
      period: String
    }
  ],
  product: [
    {
      item: { type: mongoose.Schema.Types.ObjectId, ref: 'Billitem', autopopulate: { maxDepth: 1 } },
      discount: Number,
      visits: Number,
      period: String
    }
  ],
  "addons.package": [
    {
      items: [
        {
          item: { type: mongoose.Schema.Types.ObjectId, ref: 'Billitem', autopopulate: { maxDepth: 1 } },
          discount: Number,
          visits: Number,
          period: String
        }
      ],
      services: [
        {
          serviceid: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', autopopulate: { maxDepth: 1 } },
          discount: Number,
          visits: Number,
          period: String
        }
      ],
      assets: [
        {
          serviceid: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', autopopulate: { maxDepth: 1 } },
          discount: Number,
          visits: Number,
          period: String
        }
      ],
    }
  ],
  service: [
    {
      serviceid: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', autopopulate: { maxDepth: 1 } },
      discount: Number,
      visits: Number,
      period: String
    }
  ],
  branchid: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch'}
}, {
  versionKey: false
});

PackageusagesummarySchema.plugin(mongooseautopopulate);

PackageusagesummarySchema.options.selectPopulatedPaths = false;

PackageusagesummarySchema.statics = {

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
    console.log(query)
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

module.exports = mongoose.model('Packageusagesummaryviews', PackageusagesummarySchema);
