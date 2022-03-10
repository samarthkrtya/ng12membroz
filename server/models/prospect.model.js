const mongoose = require('mongoose');
const mongooseHistory = require('../lib/mongoose-history');
const mongooseautopopulate = require('mongoose-autopopulate');
const common = require('../helpers/common');

const ProspectSchema = new mongoose.Schema({
  walletnumber: {
    type: String
  },
  fullname: String,
  stage: { type: String, default: "NEW" },
  profilepic: String,
  property: Object,
  attachments: [],
  campaignid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    autopopulate: { maxDepth: 2 }
  },
  handlerid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    autopopulate: { maxDepth: 2 }
  },
  addons: [
    {
      membershipid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Membership",
        autopopulate: { maxDepth: 2 }
      },
      paymentterms: [
        { type: mongoose.Schema.Types.ObjectId, ref: "Paymentterm", autopopulate: { maxDepth: 2 } },
      ],
      membershipstart: Date,
      membershipend: Date,
      status: { type: String, default: "active" }
    },
  ],
  status: { type: String, default: "active" },
  branchid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch"
  },
  memberid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Member"
  },
  addedby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }
}, {
  versionKey: false,
  timestamps: true
});

ProspectSchema.plugin(mongooseautopopulate);

ProspectSchema.options.selectPopulatedPaths = false;

var options = {customCollectionName: "histories", diffOnly: true, metadata: [{key: 'schemaname', value: 'prospects'} ]}

ProspectSchema.plugin(mongooseHistory, options)

ProspectSchema.pre("save", function (next) {
  if (this.property) {
    var name = "";
    if (this.property.first_name && this.property.first_name != "") {
      name = this.property.first_name + " ";
    }
    if (this.property.middle_name && this.property.middle_name != "") {
      name += this.property.middle_name + " ";
    }
    if (this.property.last_name && this.property.last_name != "") {
      name += this.property.last_name + " ";
    }
    if (this.property.surname && this.property.surname != "") {
      name += this.property.surname + " ";
    }
    if (this.property.full_name && this.property.full_name != "") {
      name += this.property.full_name + " ";
    }
    if (this.property.fullname && this.property.fullname != "") {
      name += this.property.fullname + " ";
    }
    this.fullname = name.trim();

  }

  next();
});

ProspectSchema.statics = {

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
    if (params.searchtext && !Array.isArray(params.searchtext)){
     // query["$text"] = { $searchtext: params.searchtext }
      query["$text"] = { $search: '"' + params.searchtext +  '"' }

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
      .then((prospects) => {
        return prospects;
      })

  },

  findcount(req) {

    var params = req.body;
    var size = parseInt(params.size);
    var query = common.generatequery(params);
    if (params.searchtext && !Array.isArray(params.searchtext)){
      query["$text"] = { $search: '"' + params.searchtext +  '"' }
    }
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
      .then((prospects) => {
        return prospects;
      })

  }


};

module.exports = mongoose.model('Prospect', ProspectSchema);
