const mongoose = require('mongoose');
const mongooseHistory = require('../lib/mongoose-history');
const mongooseautopopulate = require('mongoose-autopopulate');
const common = require('../helpers/common');

var optionsFunction = function() {  
  var value = typeof this.projection;  
  if (value == "function" && this.projection()) {
    var arr = []
    //console.log(this.getOptions())
    for (const property in this.getOptions()) {
      var prop  = property.split(".");
      if (prop.length > 1 && prop[0] != "property")
      {
        arr.push(prop[1])
      }
    }
    //console.log("arr", arr)
    return { select: arr, maxDepth: 2 }
  }
  else 
  return { maxDepth: 2 }
};

const ServiceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  category:  {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Formdata',
    autopopulate: { maxDepth: 2, select: 'property' }
  },
  duration: Number, //MIN
  type: String,
  charges: { type: Number, default: 0 },
  commission: { type: Number, default: 0 },
  assistantcommission: { type: Number, default: 0 },  
  taxes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tax',
    autopopulate: { maxDepth: 1 }
  }],
  staffcommission: [{
    userid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      autopopulate: { maxDepth: 2 }
    },
    charges: Number,
    commission: Number,
  }],
  availability: {
    days: [],
    starttime: String,
    endtime: String
  },
  rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Asset',  autopopulate:  optionsFunction }],
  assets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Asset',  autopopulate:  optionsFunction }],
  items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Billitem' , autopopulate:  optionsFunction }],
  staffavailability: [{
    userid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      autopopulate: { maxDepth: 2 }
    },
    days: [],
    starttime: String,
    endtime: String
  }],
  breaktime: [{
    title: String,
    days: [], ////
    starttime: String,
    endtime: String
  }],
  staff: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      autopopulate:  optionsFunction
    }
  ],
  supportstaff: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      autopopulate:  optionsFunction
    }
  ],
  gallery: [],
  property: Object,
  branchid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch'
  },
  addedby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  wfstatus: String,
  wfreviewers: Object,
  wfrapprovers: Object,
  status: { type: String, default: "active" }
}, {
  versionKey: false,
  timestamps: true
});

ServiceSchema.plugin(mongooseautopopulate);

ServiceSchema.options.selectPopulatedPaths = false;

var options = {customCollectionName: "histories", diffOnly: true, metadata: [{key: 'schemaname', value: 'services'} ]}

ServiceSchema.plugin(mongooseHistory, options)

ServiceSchema.statics = {

  getbyfilter(params) {

    var query = common.generatequery(params);
    var fields = common.generateselect(params.select);
    var fields2 = common.generateselect2(params.select);
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
      .setOptions(fields2)
      .exec()
      .then((services) => {
        return services;
      })
      .catch((e) => console.log(e))

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
      .then((services) => {
        return services;
      })

  }


};

module.exports = mongoose.model('Service', ServiceSchema);
