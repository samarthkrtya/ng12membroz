const Joi = require('joi');
const Formfield = require('../models/formfield.model');
var ObjectID = require('mongodb').ObjectID;
const formSchema = Joi.object({
  sectionname: Joi.string().allow(null, ''),
  sectiondisplayname: Joi.string().allow(null, ''),
  formname: Joi.string().required(),
  formid: Joi.string().required(),
  displayname: Joi.string(),
  min: Joi.number().allow(null, ''),
  max: Joi.number().allow(null, ''),
  maxlength: Joi.number().allow(null, ''),
  multiselect: Joi.boolean().allow(null, ''),
  fieldname: Joi.string().required(),
  fieldtype: Joi.string().required(),
  required: Joi.boolean().required(),
  lookupdata: Joi.array(),
  colspan: Joi.string(),
  formorder: Joi.string(),
  form: Joi.object(),
  lookupfieldid: Joi.string(),
  defaultvalue: Joi.string(),
  fields: Joi.array(),
  branchid: Joi.string().hex(),
  addedby: Joi.string().hex(),
  checklist: Joi.boolean().allow(null, ''),
  status: Joi.string(),
})


module.exports = {
  insert,
  update,
  patch,
  filter,
  remove,
  findbyId,
  getschema,
  getformfields,
  getworkshopformfields,
  updateformorder,
  findcount,
  getquickformschema,
  exportdata,
  removeall
}

async function getquickformschema(req, res, next)
{
  var data = req.body.formfields;
  var formname = req.params.formname;
  var branchid = req.body.branchid ? req.body.branchid: req.body.authkey.branchid._id;
  var query = {
    "formname": formname,
    "$or": [
       { "branchid": branchid },
       { "branchid": {  "$exists": false } },
    ]
  }

  Formfield.find(query)
                 .sort({ "formorder": 1})
                 .then((formfields) =>{

                  formfields.forEach((f)=>{
                      f.fieldname = "property." + f.fieldname;
                      data.push(f);
                  })

                  res.json(data);

                 })

}

async function findbyId(Id) {
  return await Formfield.findById(Id);
}

async function insert(req) {

  var branchid = req.body.authkey.branchid._id.toString();
  var addedby = req.body.authkey._id.toString();

  var formfield = {
    sectionname: req.body.sectionname,
    sectiondisplayname: req.body.sectiondisplayname,
    formname: req.body.formname,
    formid: req.body.formid,
    displayname: req.body.displayname,
    fieldname: req.body.fieldname,
    fieldtype: req.body.fieldtype,
    required: req.body.required,
    multiselect: req.body.multiselect,
    min: req.body.min,
    max: req.body.max,
    maxlength: req.body.maxlength,
    lookupdata: req.body.lookupdata,
    colspan: req.body.colspan,
    defaultvalue: req.body.defaultvalue,
    formorder: req.body.formorder,
    form: req.body.form,
    fields: req.body.fields,
    lookupfieldid: req.body.lookupfieldid,
    branchid: branchid,
    addedby: addedby,
    checklist: req.body.checklist,
    status: req.body.status,
  }
  formfield = await Joi.validate(formfield, formSchema, { abortEarly: false });
  return await new Formfield(formfield).save(req);
}

async function update(Id, req) {
  var formfield = await Formfield.findById(Id);
  formfield._original = formfield.toObject();
  formfield.property = req.body.property

  formfield.sectionname = req.body.sectionname;
  formfield.sectiondisplayname = req.body.sectiondisplayname;
  formfield.formname = req.body.formname;
  formfield.formid = req.body.formid;
  formfield.displayname = req.body.displayname;
  formfield.fieldname = req.body.fieldname;
  formfield.fieldtype = req.body.fieldtype;
  formfield.min = req.body.min;
  formfield.max = req.body.max;
  formfield.maxlength = req.body.maxlength;
  formfield.required = req.body.required;
  formfield.multiselect = req.body.multiselect;
  formfield.lookupdata = req.body.lookupdata;
  formfield.colspan = req.body.colspan;
  formfield.defaultvalue = req.body.defaultvalue;
  formfield.formorder = req.body.formorder;
  formfield.form = req.body.form;
  formfield.fields = req.body.fields;
  formfield.checklist = req.body.checklist;
  formfield.lookupfieldid = req.body.lookupfieldid;

  return await formfield.save(req);
}

async function findcount(params) {
  return await Formfield.findcount(params)
}

async function exportdata(params) {
  return await Formfield.exportdata(params)
}

async function patch(Id, req) {
  var formfield = await Formfield.findById(Id);
  if (req.body.sectionname) formfield.sectionname = req.body.sectionname;
  if (req.body.sectiondisplayname) formfield.sectiondisplayname = req.body.sectiondisplayname;
  if (req.body.status) formfield.status = req.body.status;
  if (req.body.fieldsadd) {
    formfield.fields.push(req.body.fields);
  } else if (req.body.fields) {
    formfield.fields = req.body.fields
  };
  return await formfield.save(req);
}

async function remove(Id, req) {
  await Formfield.findByIdAndRemove(Id);
  return { "message": 'Offer Deleted!'};
}

async function filter(req) {
  return await Formfield.getbyfilter(req)
}

async function removeall(req) {
  Formfield.deleteMany({ formid: req.formid }).then()
  return { "message": 'field Deleted!'};;
}

async function getschema(data, req, res) {

  var fieldarray=data;
  var formname = req.params.formname;
  return await Formfield.getpropertyschema(formname, fieldarray);

}

async function updateformorder(formfields) {

  var formorder = 1;
  formfields.forEach(id => {

    Formfield.findByIdAndUpdate(ObjectID(id), { "$set": { "formorder": formorder } }).then()
    formorder += 1;

  });

  return formfields;

}

async function getformfields(req, formname) {

  var rolepermissions = req.body.authkey.role.permissions;
  var permissions = [];
  if (rolepermissions)
    rolepermissions.forEach((rolepermission) => {

      if (rolepermission.formname == formname && rolepermission.fieldpermission) {
        rolepermission.fieldpermission.forEach((edit) => {
          if (edit.type == "edit") {
            permissions.push(...edit.fields);
          }
          if (edit.type == "add") {
            permissions.push(...edit.fields);
          }
        })
      }

    })
  var fields = await Formfield.find({ formname: formname })

  var groupfields = []
  fields.forEach((field)=>{

    if (field.fieldtype=="group") {
      field.fields.forEach((gfield)=>{
        gfield["parent"] = field.fieldname;
      })
      groupfields.push(...field.fields)
    }

  });


  var profile = req.body.profile;
  var mainobj = {}
  for (const prop in profile) {

    if (typeof profile[prop] == 'object' && !prop.includes("$")) {
      var userobject = {}
      var obj = profile[prop];
      for (const property in obj) {

        var field = fields.find((field) => {
          return field.fieldname == property.toString();
        })

        if (field) {
        field.value = obj[property];
          var permission = permissions.find((permission)=>{
              return permission == field.fieldname;
          })
          if (permission) field.editable = true;
          userobject[field.fieldname] = field;
        }
        else {
          userobject[property] = { "displayname": property, "fieldname": property, "fieldtype": "text", value: obj[property] };
        }

      }
      mainobj[prop] = userobject;

    } else if (typeof profile[prop] == 'object' && prop.includes("$")) {

      var array = profile[prop]["data"];
      var fieldname = profile[prop]["fieldname"];
      var prop1 = prop.replace("$",'');
      var data = [];

      if (!array) {
        var userobject = {}
        var groupfs = groupfields.filter((groupfield)=>{
           return groupfield.parent ==fieldname;
        });

        groupfs.forEach((field) => {
          var obj = { ...field }
          var permission = permissions.find((permission) => {
            return permission == field.fieldname;
          })
          if (permission) obj.editable = true;
          userobject[field.fieldname] = obj;

        })
        data.push(userobject);
      }
      else {
        array.forEach((item) => {

          var userobject = {};
          for (const property in item) {

            var field = groupfields.find((field) => {
              return field.fieldname == property.toString();
            })

            if (field) {
              var obj = { ...field }
              obj.value = item[property];
              var permission = permissions.find((permission) => {
                return permission == field.fieldname;
              })
              if (permission) obj.editable = true;
              userobject[field.fieldname] = obj;
            }
            else {
              userobject[property] = { "displayname": property, "fieldname": property, "fieldtype": "text", value: item[property] };
            }

          }
          data.push(userobject);
        })
      }
      var editable = false;
      var fieldname = profile[prop]["fieldname"];
      var permission = permissions.find((permission)=>{
        return permission == fieldname;
      })
      if (permission) editable = true;

      mainobj[prop1] = { order: profile[prop]["order"], type: "Array", editable: editable,  "fieldname": fieldname, "data": data };
    } else {
      mainobj[prop] = profile[prop];
    }

  }
  return mainobj;

}

async function getworkshopformfields(req, formname) {
  var rolepermissions = req.body.authkey.role.permissions;
  var permissions = [];
  if (rolepermissions)
    rolepermissions.forEach((rolepermission) => {

      if (rolepermission.formname == formname && rolepermission.fieldpermission) {
        rolepermission.fieldpermission.forEach((edit) => {
          if (edit.type == "edit") {
            permissions.push(...edit.fields);
          }
          if (edit.type == "add") {
            permissions.push(...edit.fields);
          }
        })
      }

    })
  var fields = await Formfield.find({ formname: formname })

  return fields;
}

