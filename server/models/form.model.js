const mongoose = require('mongoose');
const common = require('../helpers/common');
const mongooseautopopulate = require('mongoose-autopopulate');

const FormSchema = new mongoose.Schema({
  formname: String,
    dispalyformname: String,
    schemaname: String,
    addeditredirecturl: String,
    viewname: String,
    formlistname : String,
    formtype : String,
    doctemplate: String,
    parentid : { type: mongoose.Schema.Types.ObjectId, ref: 'Form'},
    workflowid: { type: mongoose.Schema.Types.ObjectId, ref: 'Workflow', autopopulate: { maxDepth: 1 } },
    reportscheduleid: { type: mongoose.Schema.Types.ObjectId, ref: 'Reportscheduler', autopopulate: { maxDepth: 3 } },
    addbuttonurl : String,
    addurl : Object,
    editurl : Object,
    listurl: Object,
    mainlisturl: Object,
    samplecsvurl: String,
    geturl: Object,
    tinyurl: String,
    langresources: Object,
    rootfields : [],
    functions: [],
    tabs: [],
    viewaction : [],
    gridaction : [],
    formaction : [],
    searchfields : [],
    displayfields : [],
    property: Object,
    issystemform: { type: Boolean, default: false },
    branchid:{ type: mongoose.Schema.Types.ObjectId, ref: 'Branch'},
    addedby: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    status: { type: String, default: "active" }
}, {
  versionKey: false,
  timestamps: true
});

FormSchema.plugin(mongooseautopopulate);

FormSchema.options.selectPopulatedPaths = false;

FormSchema.statics = {


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

module.exports = mongoose.model('Form', FormSchema);
