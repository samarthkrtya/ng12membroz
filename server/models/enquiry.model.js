const mongoose = require('mongoose');
const mongooseHistory = require('../lib/mongoose-history');
const mongooseautopopulate = require('mongoose-autopopulate');
const common = require('../helpers/common');


const EnquirySchema = new mongoose.Schema({
  fullname: String,
  profilepic: String,
  stage: { type: String, default: "Fresh" },
  property: Object,
  attachments: [],
  transactions: { type: Number, default: 0 },
  campaignid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    autopopulate: { maxDepth: 2 }
  },
  status: { type: String, default: "active" },
  handlerid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    autopopulate: { maxDepth: 2 },
  },
  dispositionid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Disposition',
    autopopulate: { maxDepth: 1 },
  },
  branchid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch"
  },
  prospectid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Prospect"
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

EnquirySchema.plugin(mongooseautopopulate);

EnquirySchema.options.selectPopulatedPaths = false;

var options = {customCollectionName: "histories", diffOnly: true, metadata: [{key: 'schemaname', value: 'enquiries'} ]}

EnquirySchema.plugin(mongooseHistory, options)

EnquirySchema.pre("save", function (next) {
  if (this.property) {
    var name = "";
    if (this.property.first_name && this.property.first_name != "") {
      name = this.property.first_name + " ";
    }
    if (this.property.middle_name && this.property.middle_name != "") {
      name += this.property.middle_name + " ";
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

EnquirySchema.statics = {


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
      .then((enquiries) => {
        return enquiries;
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
      .then((enquiries) => {
        return enquiries;
      })

  }
};

module.exports = mongoose.model('Enquiry', EnquirySchema);
