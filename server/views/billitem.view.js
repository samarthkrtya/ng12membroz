const mongoose = require('mongoose');
const mongooseautopopulate = require('mongoose-autopopulate');
const common = require('../helpers/common');

const BillitemviewSchema = new mongoose.Schema({
  itemname: String,
  stock: Number,
  barcode: String,
  unit: String,
  category: String,
  categoryid: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Formdata'
  },
  type:  String,
  item_logo : String,
  purchaseorders: [{
     type: mongoose.Schema.Types.ObjectId, ref: 'Purchaseorder', autopopulate: { maxDepth: 2 }
  }],
  purchaseinvoices: [{
    type: mongoose.Schema.Types.ObjectId, ref: 'Purchaseinvoice',autopopulate: { maxDepth: 2 }
  }],
  purchase: {
    rate: Number,
    description: String,
    taxes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tax', autopopulate: { maxDepth: 2 } }],
  },
  sale: {
    rate: Number,
    discount: Number,
    description: String,
    taxes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tax', autopopulate: { maxDepth: 2 }}]
  },
  rent: [{
    rate: Number, // 2,7
    unit: String, // hour,km
    taxes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tax', autopopulate: { maxDepth: 2 } }]
  }],
  enableinventory: Boolean,
  branchid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch'
  },
  property: Object,
  status: { type: String, default: "active" }
}, {
  versionKey: false
});


BillitemviewSchema.plugin(mongooseautopopulate);

BillitemviewSchema.options.selectPopulatedPaths = false;

BillitemviewSchema.statics = {


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

    return this.find(query)
    .select(fields)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean({ virtuals: true, autopopulate: { maxDepth: 2 } })
      .exec()
      .then((billitems) => {
        return billitems;
      })

  }

};

module.exports = mongoose.model('Billitemview', BillitemviewSchema, "billitemviews");
