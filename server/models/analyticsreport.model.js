import Promise from 'bluebird';
import mongoose from 'mongoose';
import common from '../helpers/common';
/**
 * Analyticsreport Schema
 */
const AnalyticsreportSchema = new mongoose.Schema({
  title: String,
  aggregates: [],
  reporttype: String,
  mergefield: String,
  fields: [],
  footerfields: [],
  matchingfields: [],
  type: String, // Condition, Charts
  chartsinfo:[],
  message: String, // Condition, Charts
  filters: [],
  postbackfilterfields: [],
  category:String,
  filepath: String,
  branchid:{ type: mongoose.Schema.Types.ObjectId, ref: 'Branch'}
}, { versionKey: false, timestamps : false, id:false });

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */


/**
 * Methods
 */
AnalyticsreportSchema.method({
});

/**
 * Statics
 */
AnalyticsreportSchema.statics = {


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
      .lean({ virtuals: true })
      .exec()
      .then((analyticsreports) => {
        return analyticsreports;
      });
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
      .then((analyticsreports) => {
        return analyticsreports;
      })

  }

};

/**
 * @typedef Analyticsreport
 */
export default mongoose.model('Analyticsreport', AnalyticsreportSchema);

