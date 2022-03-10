const mongoose = require('mongoose');
const mongooseautopopulate = require('mongoose-autopopulate');
const common = require('../helpers/common');

const CampaignviewSchema = new mongoose.Schema({
  campaignname: String,
  saleschannelteams: { type: mongoose.Schema.Types.ObjectId, ref: 'Saleschannelteam', autopopulate: { maxDepth: 4 }},
  leads: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Enquiry'}],
  property: Object,
  branchid: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch'},
  addedby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: { type: String, default: "active" }
}, {
  versionKey: false
});

CampaignviewSchema.plugin(mongooseautopopulate);

CampaignviewSchema.options.selectPopulatedPaths = false;

CampaignviewSchema.statics = {

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
      .then((campaigns) => {
        return campaigns;
      })

  },


};

module.exports = mongoose.model('Campaignview', CampaignviewSchema);
