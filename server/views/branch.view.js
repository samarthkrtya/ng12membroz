const mongoose = require('mongoose');
const mongooseautopopulate = require('mongoose-autopopulate');
const common = require('../helpers/common');

const BranchviewSchema = new mongoose.Schema({
  branchname: String,
  users: [],
  timesheets: [{ _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Attendance', autopopulate: { maxDepth: 2 } } }],
  leaverequests: [{ _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Leaverequest', autopopulate: { maxDepth: 2 } } }],
  shareddocuments: [{ _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Formdata', autopopulate: { maxDepth: 1 } } }],
  timezone: String,
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

BranchviewSchema.plugin(mongooseautopopulate);

BranchviewSchema.options.selectPopulatedPaths = false;

BranchviewSchema.statics = {

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
      .then((branches) => {
        return branches;
      })

  },


};

module.exports = mongoose.model('Branchview', BranchviewSchema);
