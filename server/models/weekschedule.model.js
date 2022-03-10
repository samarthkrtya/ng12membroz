const mongoose = require('mongoose');
const mongooseHistory = require('../lib/mongoose-history');
const mongooseautopopulate = require('mongoose-autopopulate');
const common = require('../helpers/common');

const WeekscheduleSchema = new mongoose.Schema({
  title: String,
  type: { type: String, default: "active" },
  formid: {
    type: mongoose.Schema.Types.ObjectId, // Diet Template , Workout Template
    ref: 'Form',
    autopopulate: { maxDepth: 1 }
  },
  scheduleformid: {
    type: mongoose.Schema.Types.ObjectId, // Recipe, Exercise
    ref: 'Form',
    autopopulate: { maxDepth: 1 }
  },
  schedule: [
    {
      day: String, // Monday, Tuesday
      heading: String, // Lunch, Dinner
      minutes: Number,
      trainerid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        autopopulate: { maxDepth: 1 }
      },
      refid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Formdata',
        autopopulate: { maxDepth: 1 }
      },
      sets: String,
      reps: String,
      rest: String,
      amount: String,
      unit: String,
      notes: String
    }
  ],
  classid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Classroom'
  },
  memberid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member'
  },
  branchid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch'
  },
  addedby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  property: Object,
  status: { type: String, default: "active" }
}, {
  versionKey: false,
  timestamps: true
});

WeekscheduleSchema.plugin(mongooseautopopulate);

WeekscheduleSchema.options.selectPopulatedPaths = false;

var options = {customCollectionName: "histories", diffOnly: true, metadata: [{key: 'schemaname', value: 'weekschedules'} ]}

WeekscheduleSchema.plugin(mongooseHistory, options)

WeekscheduleSchema.statics = {


  getbyfilter(params) {

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
    if (params.searchtext && !Array.isArray(params.searchtext)) {
      skip = 0;
      limit = 0;
    }
    return this.find(query)
    .select(fields)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean({ virtuals: true, autopopulate: { maxDepth: 2 } })
      .exec()
      .then((weekschedules) => {
        return weekschedules;
      })

  },

  findcount(req) {

    var params = req.body;
    var size = parseInt(params.size);
    var query = common.generatequery(params);
    return this.countDocuments(query).exec().then((totalCount) =>{
        var totalPages = Math.ceil(totalCount / size)
        req.header = { "error" : false, "totalCount": totalCount , "totalPages": totalPages};
    })

  },

  exportdata(params) {

    var query = common.generatequery(params);
    var fields = common.generateselect(params.select);
    var sort = params.sort;
    if (!sort) {
      sort = {
          "updatedAt" : -1,
          "createdAt" : -1
      }
    }

    return this.find(query)
    .select(fields)
      .sort(sort)
      .lean({ virtuals: true, autopopulate: { maxDepth: 2 } })
      .exec()
      .then((weekschedules) => {
        return weekschedules;
      })

  }

};

module.exports = mongoose.model('Weekschedule', WeekscheduleSchema);
