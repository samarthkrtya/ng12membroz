const mongoose = require('mongoose');
const mongooseautopopulate = require('mongoose-autopopulate');
const common = require('../helpers/common');

const FormschemaSchema = new mongoose.Schema({
  fieldname: {
    type: String
  },
  fieldtype: {
    type: String
  },
  isMandatory: String,
  displaytext: String,
  branchid: mongoose.Schema.Types.ObjectId,
  formid: mongoose.Schema.Types.ObjectId
});

FormschemaSchema.plugin(mongooseautopopulate);

FormschemaSchema.options.selectPopulatedPaths = false;

FormschemaSchema.statics = {


  getbyfilter(formid, branchid) {

    var query = { "formid": formid, "$or": [ { "branchid": branchid }, { "branchid": {  "$exists": false } } ] }

    return this.find(query)
      .lean()
      .exec()
      .then((formschema) => {
        return formschema;
      })
  },


};

module.exports = mongoose.model('formschemaview', FormschemaSchema);
