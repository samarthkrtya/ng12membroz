const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const mongooseautopopulate = require('mongoose-autopopulate');
const common = require('../helpers/common');

const FormlistSchema = new mongoose.Schema({
  formlistname: {
    type: String,
    unique : true,
    required: true
  },
  issystem: Boolean,
  formname: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  langresources: Object,
  addbuttonurl : String,
  gridaction: [],
  massoperation: [],
  searchfield: [],
  searchreffield: [],
  selectfields: [],
  filterfields: [],
  sortfields: [],
  status: { type: String, default: "active" }
}, {
  versionKey: false
});

FormlistSchema.plugin(uniqueValidator);

FormlistSchema.statics = {


  getbyfilter(params) {
    var query = common.generatequery(params);
    var fields = common.generateselect(params.select);
    var pageNo = parseInt(params.pageNo);
    var size = parseInt(params.size);
    var limit, skip;

    var sort = params.sort;
    if (!sort) {
      sort = {
          "formname" : 1
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
      .then((forms) => {
        return forms;
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

module.exports = mongoose.model('Formlist', FormlistSchema);
