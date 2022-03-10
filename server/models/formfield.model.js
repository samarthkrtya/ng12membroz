const mongoose = require('mongoose');
const common = require('../helpers/common');

const FormfieldSchema = new mongoose.Schema({


  formid: { type: mongoose.Schema.Types.ObjectId, ref: 'Form' },
  sectionname: String,
  sectiondisplayname: String,
  formname: String,
  fieldtype: String, /// CalculatedField
  fieldname: String,
  displayname: String,
  min: Number,
  max: Number,
  maxlength: Number,
  required: Boolean,
  unique: Boolean,
  lookupdata: Array,
  colspan: String,
  validations: [],
  defaultvalue: String,
  form: Object,
  multiselect: Boolean,
  lookupfieldid: String,
  formorder: Number,
  value: Object,
  editable: Boolean,
  fields: Array,
  checklist: { type: Boolean, default: false },
  status: { type: String, default: "active" },


    // calculationformula: String, // {date_of_birth-TODAY}
    // validationData: String,
    // tab: String,
    // section: String,
    // lookupdata: Array,

    // fielddisplaytextvalue: Object,


    // key: {
    //   fielddisplaytext: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Langresource'
    //   }
    // },
    // langresources: Object,

    // membershipoffertype: String,
    // membershipofferSelectiontype: String,



    // form : String,
    // formfield : String,
    // displayvalue : String,
    // fieldfilter : String,
    // fieldfiltervalue : String,
    // apiurl : String,
    // method : String,

    // allowedfiletype: Array,
    // maxfilesize: Number,

    // inbuildlookupField: String,
    // formula: String,
    // description: String,
    // tabname: String,
    // tabdisplaytext: String,
    // sectionname: String,
    // sectiondisplaytext: String,
    // groupname: String,
    // groupdisplaytext: String,

    // isHidden: String,
    // isImport: String,
    // isDisplayOnList: Boolean,

    // issystemfield: Boolean,
    // defaulttext: String,
    // maxrating: Number,

    branchid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch'
    },
    addedby: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    updatedby: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
}, {
  versionKey: false
});

FormfieldSchema.statics = {


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
    query["$or"] = [
      { "branchid": params.authkey ? params.authkey.branchid._id : null },
      { "branchid": { "$exists": false } }
    ]
    return this.find(query)
    .select(fields)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean({ virtuals: true, autopopulate: { maxDepth: 2 } })
      .exec()
      .then((formfields) => {
        return formfields;
      })

  },

  getpropertyschema(formname, formfields, branchid) {

    return this.find({formname: formname, "$or": [ { branchid: branchid }, { branchid: { "$exists" : false }} ]})
                .then(fields => {
                  if (fields){
                    fields.forEach(function(field){

                      var obj = { "id": "property." + field.fieldname, "formname": field.formname, "fieldname": "property." + field.fieldname,
                      "fielddisplaytextvalue": field.fielddisplaytextvalue, "displayname": field.fielddisplaytext,
                      "fieldtype": field.fieldtype, "formurl": field.apiurl, "formdisplaytext": field.displayname, "fieldfilter": field.fieldfilter,
                      "required": field.required,
                      "sectionname": field.sectionname, "sectiondisplaytext": field.sectiondisplaytext,
                      "fieldfiltervalue": field.fieldfiltervalue, "formfield": field.formfield, "lookupid": field.inbuildlookupField,
                      "lookupdata": field.lookupdata, "fieldfilter": field.fieldfilter, "apiurl": field.apiurl, "method": field.method, "fieldfiltervalue": field.fieldfiltervalue,
                      "formfield": field.formfield, "id": "property." + field.fieldname}

                      formfields.push(obj);

                    });
                  }

                return formfields;

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


};

module.exports = mongoose.model('Formfield', FormfieldSchema);
