const mongoose = require('mongoose');
const mongooseHistory = require('../lib/mongoose-history');
const mongooseautopopulate = require('mongoose-autopopulate');
const common = require('../helpers/common');

const InventorySchema = new mongoose.Schema({
  itemid: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Billitem', autopopulate: { maxDepth: 2 } },
  stock: { type: Number, default: 0 },
  triggerqty: { type: Number, default: 0 },
  property: Object,
  branchid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    autopopulate: { maxDepth: 2 }
  },
  addedby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  versionKey: false,
  timestamps: true
});

InventorySchema.plugin(mongooseautopopulate);

InventorySchema.options.selectPopulatedPaths = false;

var options = {customCollectionName: "histories", diffOnly: true, metadata: [{key: 'schemaname', value: 'inventories'} ]}

InventorySchema.plugin(mongooseHistory, options)

InventorySchema.statics = {


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
      .then((inventories) => {
        if (inventories.length > 0 && params.searchref && params.searchref.length > 0) {
          return common.getfilterbyref(params.searchref, inventories)
        }
        else 
          return inventories;
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
      .then((inventories) => {
        return inventories;
      })

  }

}

module.exports = mongoose.model('Inventory', InventorySchema);
