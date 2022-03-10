const mongoose = require('mongoose');
const mongooseautopopulate = require('mongoose-autopopulate');
const common = require('../helpers/common');

const EnquiryviewSchema = new mongoose.Schema({
  fullname: String,
  profilepic: String,
  stage: { type: String, default: "Fresh" },
  property: Object,
  attachments: [],
  handlerid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    autopopulate: { maxDepth: 2 }
  },
  campaignid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    autopopulate: { maxDepth: 2 }
  },
  openactivity: [
    {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Activity",
        autopopulate: { maxDepth: 2 }
      }
    }
  ],
  closeactivity: [
    {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Activity",
        autopopulate: { maxDepth: 2 }
      }
    }
  ],
  allactivity: [
    {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Activity",
        autopopulate: { maxDepth: 2 }
      }
    }
  ],
  branchid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch"
  },
  prospectid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Prospect",
    autocomplete: true
  },
  memberid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Member",
    autocomplete: true
  },
  addedby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  status: { type: String, default: "active" },
}, {
  versionKey: false
});

EnquiryviewSchema.plugin(mongooseautopopulate);

EnquiryviewSchema.options.selectPopulatedPaths = false;

EnquiryviewSchema.statics = {

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
      .then((enquiries) => {
        return enquiries;
      })

  },


};

module.exports = mongoose.model('Enquiryview', EnquiryviewSchema);
