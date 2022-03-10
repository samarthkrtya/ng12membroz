const mongoose = require('mongoose');
const mongooseautopopulate = require('mongoose-autopopulate');
const common = require('../helpers/common');

const UserviewSchema = new mongoose.Schema({
  fullname: String,
  designationid: { type: mongoose.Schema.Types.ObjectId, ref: 'Designation' },
  salarycomponents: [
    {
      salarycomponentid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Salarycomponent'
      },
      amount: Number,
      amountannualy: Number,
      percentage: Number
    }
  ],
  leavecomponents: [{
    leavecomponentid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Leavetype',
      autopopulate: { maxDepth: 1 }
    },
    effectivedate: Date,
    balance: Number
  }],
  roleid: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
  leaverequests: [{ leavetype: { type: mongoose.Schema.Types.ObjectId, ref: 'Leavetype', autopopulate: { maxDepth: 1 } } }],
  availability: [],
  servicecharges: [],
  timesheets: [],
  designation: String,
  rolename: String,
  property: Object,
  branchid: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch'}
}, {
  versionKey: false
});

UserviewSchema.plugin(mongooseautopopulate);

UserviewSchema.options.selectPopulatedPaths = false;

UserviewSchema.statics = {

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
      .then((users) => {
        return users;
      })

  },


};

module.exports = mongoose.model('Userview', UserviewSchema);
