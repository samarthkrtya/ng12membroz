const mongoose = require('mongoose');
const mongooseautopopulate = require('mongoose-autopopulate');
const common = require('../helpers/common');

const FormviewSchema = new mongoose.Schema({
  title: String,
  formdata: Object,
  property: Object,
  formtype: String,
  workflowid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workflow',
    autopopulate: { maxDepth: 2 }
  },
  branchid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch"
  }
}, {
  versionKey: false
});

FormviewSchema.plugin(mongooseautopopulate);

FormviewSchema.options.selectPopulatedPaths = false;

FormviewSchema.statics = {

  getfilterview(params) {

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
      .then((formdatas) => {
        //console.log("formdatas", formdatas)
        return formdatas;
      })

  },


};

module.exports = mongoose.model('Formview', FormviewSchema);
