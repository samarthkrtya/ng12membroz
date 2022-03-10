const mongoose = require('mongoose');
const mongooseHistory = require('../lib/mongoose-history');
const uniqueValidator = require('mongoose-unique-validator');
const mongooseautopopulate = require('mongoose-autopopulate');
const common = require('../helpers/common');

const MenupermissionSchema = new mongoose.Schema({
  menuid: [{
    type: mongoose.Schema.Types.ObjectId, ref: 'Menu',
    required: true,
    autopopulate: { maxDepth: 2 }
  }],
  roleid: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Role',
    required: true,
    autopopulate: { maxDepth: 2 }
  },
  status: { type: String, default: "active" }
}, {
  versionKey: false
});

MenupermissionSchema.plugin(uniqueValidator);

MenupermissionSchema.plugin(mongooseautopopulate);

MenupermissionSchema.options.selectPopulatedPaths = false;

MenupermissionSchema.statics = {


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

module.exports = mongoose.model('Menupermission', MenupermissionSchema);
