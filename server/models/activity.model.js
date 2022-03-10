const mongoose = require('mongoose');
const mongooseHistory = require('../lib/mongoose-history');
const mongooseautopopulate = require('mongoose-autopopulate');

const ActivitySchema = new mongoose.Schema({
  dispositionid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Disposition',
    autopopulate: { maxDepth: 2 }
  },
  templateid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activitytemplate',
    autopopulate: { maxDepth: 2 }
  },
  serviceid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    autopopulate: { maxDepth: 1 }
  },
  type: {
    type: String,
    default: "callback" // Callback, meeting, tasks
  },
  customerid: {
    type: mongoose.Schema.Types.ObjectId, refPath: "onModel", autopopulate: { maxDepth: 3 }
  },
  onModel: {
    type: String,
    enum: [ 'Member', 'Enquiry', 'User', 'Prospect', "Vendor", "Asset" ]
  },
  refid: {
    type: mongoose.Schema.Types.ObjectId, refPath: "onRefModel", autopopulate: { maxDepth: 1 }
  },
  onRefModel: {
    type: String,
    enum: ['Member', 'Enquiry', 'User', 'Prospect', "Vendor", "Formdata", "Leaverequest", "Support", "Joborder", "Attendance"]
  },
  duedate: {
    type: Date,
  },
  priority: {
    type: String,
  },
  duration: Number,
  assingeeuser: { type: mongoose.Schema.Types.ObjectId, ref: "User", autopopulate: { maxDepth: 1 } },
  assingeerole: [{ type: mongoose.Schema.Types.ObjectId, ref: "Role" }],
  branchid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    autopopulate: { maxDepth: 1 }
  },
  addedby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    autopopulate: { maxDepth: 1 }
  },
  updatedby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  property: Object,
  status: { type: String, default: "active" }
}, {
  versionKey: false,
  timestamps: true
});

ActivitySchema.plugin(mongooseautopopulate);

ActivitySchema.options.selectPopulatedPaths = false;

var options = {customCollectionName: "histories", diffOnly: true, metadata: [{key: 'schemaname', value: 'activities'} ]}

ActivitySchema.plugin(mongooseHistory, options)


ActivitySchema.statics = {


  getbyfilter(params) {

    const common = require('../helpers/common');

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

    fields["onModel"] = 1
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
      .then((activities) => {
        return activities;
      })
      .catch((e) => console.log(e))

  },

  findcount(req) {
    const common = require('../helpers/common');
    var params = req.body;
    var size = parseInt(params.size);
    var query = common.generatequery(params);
    return this.countDocuments(query).exec().then((totalCount) =>{
        var totalPages = Math.ceil(totalCount / size)
        req.header = { "error" : false, "totalCount": totalCount , "totalPages": totalPages};
    })

  },

  exportdata(params) {
    const common = require('../helpers/common');
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
      .then((activities) => {
        return activities;
      })

  }


};

module.exports = mongoose.model('Activity', ActivitySchema);
