const mongoose = require('mongoose');
const mongooseautopopulate = require('mongoose-autopopulate');
const common = require('../helpers/common');


const ReportschedulerviewSchema = new mongoose.Schema({
  formname: {
    type: String,
  },
  schemaname: {
    type: String
  },
  aggregate: [],
  branchid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    autopopulate: { maxDepth: 1 }
  },
  action: {
    email: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Communication',
      autopopulate: { maxDepth: 3 }
    }],
    mailmerge: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Communication',
      autopopulate: { maxDepth: 2 }
    }],
    sms: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Communication',
      autopopulate: { maxDepth: 2 }
    }],
    whatsapp: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Communication',
      autopopulate: { maxDepth: 2 }
    }],
    notification: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Communication',
      autopopulate: { maxDepth: 2 }
    }],
    tasks: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Activitytemplate',
      autopopulate: { maxDepth: 2 }
    }],
    updatetasks: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Activitytemplate',
      autopopulate: { maxDepth: 1 }
    }],
  },
  property: {
    frequency: String,
    userid:[{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      autopopulate: { maxDepth: 2 }
    }]
  },
  status: { type: String, default: "active" }
}, {
  versionKey: false
});

ReportschedulerviewSchema.plugin(mongooseautopopulate);

ReportschedulerviewSchema.options.selectPopulatedPaths = false;

ReportschedulerviewSchema.statics = {


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
      .then((activities) => {
        return activities;
      })
      .catch((e) => console.log(e))

  },


};

module.exports = mongoose.model('Reportschedulerview', ReportschedulerviewSchema);
