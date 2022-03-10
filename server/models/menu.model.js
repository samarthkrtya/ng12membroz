const mongoose = require('mongoose');
const mongooseHistory = require('../lib/mongoose-history');
const uniqueValidator = require('mongoose-unique-validator');
const mongooseautopopulate = require('mongoose-autopopulate');
const common = require('../helpers/common');
const MenuSchema = new mongoose.Schema({
  menuname: {
    type: String,
    unique : true,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  key: {
    title: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Langresource'
    },
    description: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Langresource'
    }
  },
  langresources: Object,
  description: String,
  url: String,
  materialicon: String,
  shortname: String,
  istop: Boolean,
  ismobilemenu: Boolean,
  mobileimage: String,
  parent: String,
  group: String, // Organization, Marketing, Mail
  menuindex: Number,
  value: Object,
  property: Object,
  status: { type: String, default: "active" }
}, {
  versionKey: false
});

MenuSchema.plugin(uniqueValidator);

MenuSchema.statics = {


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
      .then((users) => {
        return users;
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

};

module.exports = mongoose.model('Menu', MenuSchema);
