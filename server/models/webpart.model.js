const mongoose = require('mongoose');
const common = require('../helpers/common');

const WebpartSchema = new mongoose.Schema({
  formid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Form',
    //required: true
  },
  webparttype: {
    type: String, // single-data, multi-data, grid, charts
    //required: true
  },
  columns: {
    type: Number,  // 1, 2, 3, 4
    required: true
  },
  filter: Object,
  searchid: [],
  fields: [],
  apiurl: Object,  //api/dashboards/aggregate/
  displayformat: String,
  linkurl: String,
  schemaname: String,
  category: String,
  icon: String,
  iconbackground: String,
  isglobaldatefilter: Boolean,
  globalfilterdata: Object, //{"globalfilterfield": 'membershipstart',"defaultfilterfields":[]}
  isredirectfilter: Boolean,
  redirectfilterdata: Object, //{"globalfilterfield": '',"defaultfilterfields":[]}

  property: Object,
  status: { type: String, default: "active" }
}, { versionKey: false, timestamps : false });

WebpartSchema.statics = {


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


};

module.exports = mongoose.model('Webpart', WebpartSchema);
