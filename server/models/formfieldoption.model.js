const mongoose = require('mongoose');
const common = require('../helpers/common');

const FormfieldoptionSchema = new mongoose.Schema({
  formname:  {
    type: String,
    required: true
  },
  fieldname: {
    type: String,
    required: true
  },
  displayname: {
    type: String,
    required: true
  },
  validation: [],
  isMandatory: String,
  required: Boolean,
  fieldtype: String,
  lookupid: String,
  schemaname: String,
  virtualfield: Object,
  refform: {
    type: String
  },
  option: {
    ref:String,
    refschema: String,
    reffieldname: String,
    iscontext: Boolean
  },
  status: { type: String, default: "active"}
}, {
  versionKey: false
});

FormfieldoptionSchema.statics = {


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

  getfieldsbyformname(formname, rootonly) {

    var fieldsarray=[];

    return this.find({ })
          .select({ formname:1, fieldname:1, fieldtype:1, validation: 1, displayname:1, _id:0, refform:1, option:1, lookupid: 1, isMandatory: 1, isImport: 1, virtualfield:1, reverseref: 1, langresources: 1 })
          .lean({ virtuals: true })
          .exec()
          .then((formfieldoptions) => {

            formfieldoptions.forEach(element => {

                if (element.formname==formname)
                {
                    fieldsarray.push(element);

                    if (!rootonly && Array.isArray(element.refform)){
                      element.refform.forEach(e => {
                        common.refformfields(formfieldoptions,fieldsarray, e, element.fieldname);
                      })
                    }
                    else if (!rootonly && element.refform && element.refform != formname){
                        common.refformfields(formfieldoptions,fieldsarray, element.refform, element.fieldname);
                    }
                    else {
                      element["id"] = element["fieldname"];
                    }

                }

            });

            var filtered = fieldsarray.filter(function (el) {
              return el != null;
            });

            var idfield = { formname: formname, fieldname: "_id", fieldtype: "ObjectId", id:"_id", displayid: "ID", displayname: "ID"  }
            filtered.push(idfield);

            return filtered;
          });

  },

};

module.exports = mongoose.model('Formfieldoption', FormfieldoptionSchema);
