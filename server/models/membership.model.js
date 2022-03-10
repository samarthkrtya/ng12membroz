const mongoose = require('mongoose');
const mongooseHistory = require('../lib/mongoose-history');
const mongooseautopopulate = require('mongoose-autopopulate');
const common = require('../helpers/common');


var optionsFunction = function() {
  var value = typeof this.projection;  
  if (value == "function" && this.projection()) {
    var arr = []
    for (const property in this.getOptions()) {
      var prop  = property.split(".");
      if (prop.length > 1 && prop[0] == "serviceid")
      {
        arr.push(prop[1])
      }
    }    
    return { select: arr, maxDepth: 2 }
  }
  else 
  return { maxDepth: 2 }
};

const MembershipSchema = new mongoose.Schema({
  membershipname: {
    type: String,
    required: true
  },
  profilepic: String,
  subjects: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Formdata' , autopopulate: { maxDepth: 1 } }
  ],
  services: [{
    serviceid: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' , autopopulate: optionsFunction },
    discount: Number,
    visits: Number,
    period: String // Monthly/Yearly/PACKAGE DURATION
  }],
  items: [{
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Billitem', autopopulate: { maxDepth: 2 } },
    discount: Number,
    quantity :Number,
    period: String // Monthly/Yearly/PACKAGE DURATION
  }],
  assets: [{
    serviceid: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset' , autopopulate: { maxDepth: 2 }  },
    discount: Number,
    visits: Number,
    period: String // Monthly/Yearly/PACKAGE DURATION
  }],
  usageterms: {
    eligiblenight: Number,
    eligiblepernight: String,
    minnight: Number,
    minperbooking: String,
    maxnight: Number,
    maxperbooking: String,
    advancenight: Number,
    advancebookingnoticemin: Number,
    advancebookingnoticemax: Number
  },
  property: Object,
  branchid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch'
  },
  addedby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: { type: String, default: "active" }
}, {
  versionKey: false,
  timestamps: true
});

MembershipSchema.plugin(mongooseautopopulate);

MembershipSchema.options.selectPopulatedPaths = false;

var options = {customCollectionName: "histories", diffOnly: true, metadata: [{key: 'schemaname', value: 'memberships'} ]}

MembershipSchema.plugin(mongooseHistory, options)

MembershipSchema.statics = {

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
      .then((memberships) => {
        return memberships;
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
      .then((memberships) => {
        return memberships;
      })

  }

};

module.exports = mongoose.model('Membership', MembershipSchema);
