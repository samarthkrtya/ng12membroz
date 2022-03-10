const mongoose = require('mongoose');
const mongooseautopopulate = require('mongoose-autopopulate');
const common = require('../helpers/common');

const GroupclassviewSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  membershipid: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Membership',
    required: true
  },
  assigneeuser: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User'
  },
  branchid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch"
  },
  addedby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  property: Object,
  status: { type: String, default: "active" },
}, {
  versionKey: false
});

GroupclassviewSchema.plugin(mongooseautopopulate);

GroupclassviewSchema.options.selectPopulatedPaths = false;

GroupclassviewSchema.statics = {

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

module.exports = mongoose.model('Groupclassview', GroupclassviewSchema);
