const mongoose = require('mongoose');
const mongooseautopopulate = require('mongoose-autopopulate');
const common = require('../helpers/common');

const UsermenuSchema = new mongoose.Schema({
  menuname: {
    type: String,
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

UsermenuSchema.plugin(mongooseautopopulate);

UsermenuSchema.options.selectPopulatedPaths = false;

UsermenuSchema.statics = {


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
      .then((users) => {
        return users;
      })

  },


};

module.exports = mongoose.model('Usermenu', UsermenuSchema);
