const Joi = require('joi');
var ObjectID = require('mongodb').ObjectID;
const Formdata = require('../models/formdata.model');
const Formfield = require('../models/formfield.model');
const Prospect = require('../models/prospect.model');
const Appointment = require('../models/appointment.model');
const Quotation = require('../models/quotation.model');
const Joborder = require('../models/joborder.model');
const Member = require('../models/member.model');
const Asset = require('../models/asset.model');
const moment = require('moment');
var MongoClient = require('mongodb').MongoClient;
var url = process.env.MONGO_HOST;

const formdataSchema = Joi.object({
  formid: Joi.string().hex().required(),
  contextid: Joi.string().hex(),
  onModel: Joi.string(),
  property: Joi.object()
})


module.exports = {
  insert,
  update,
  patch,
  remove,
  filter,
  findcount,
  findbyId,
  exportdata,
  convertdatatype,
  validatedata,
  populatefield,
  populateproductandservices,
  // updateInspetion,
  workshopupdate,
  removeall,
  synsuprauser
}

async function findbyId(Id) {
  return await Formdata.findById(Id);
}

async function insert(req) {
  var body = req.body;
  var contextid = body.contextid ? body.contextid : body.property.contextid;
  var onModel = body.onModel ? body.onModel : body.property.onModel;

  if (!onModel && contextid) {
    var member = await Member.findById(contextid);
    if (member) onModel = "Member"
    else {
      var prospect = await Prospect.findById(contextid);
      if (prospect) onModel = "Prospect"
      else {
        var asset = await Asset.findById(contextid);
        if (asset) onModel = "Asset"
      }
    }
  }

  var formdata = {
    formid: body.formid,
    property: body.property,
    contextid: contextid,
    onModel: onModel,
  }
  if (formdata.property && formdata.property['signed']){
    formdata.property['acknowledged'] = true
  }

  await Joi.validate(formdata, formdataSchema, { abortEarly: false });
  return await new Formdata(formdata).save(req);
}

async function populatefield(req) {
  var formname = req.body.data && req.body.data[0] && req.body.data[0].formid ? req.body.data[0].formid.formname:'';

  var fields = await Formfield.find({ formname: formname })

  var formdatas = req.body.data;

  req.body.formfield = fields;

  var client = await MongoClient.connect(url);

  var db = client.db();

  for (var i = 0; i < formdatas.length; i++) {

    var formdata = formdatas[i]
    var property = formdata.property;

    for (var j = 0; j < fields.length; j++) {

      var field = fields[j];

      if (field.fieldtype == "form" && !field.multiselect && property[field.fieldname] && field.form && field.form.apiurl) {

        var id = property[field.fieldname];
        var schemaname = field.form.apiurl.replace("/filter", '');
        var result = await db.collection(schemaname).findOne({ _id: ObjectID(id) })
        formdata.property[field.fieldname] = result;

      }
      else if (field.fieldtype == "form" && property[field.fieldname] && field.form && field.form.apiurl) {

        var id = property[field.fieldname];        
        formdata.property[field.fieldname] = id;

      }

      if (field.fieldtype == "group") {

        var anotherfields = field.fields;
        for (var k = 0; k < anotherfields.length; k++) {

          var anotherfield = anotherfields[k];

          if (anotherfield.fieldtype == "form") {

            var ids= property[field.fieldname][anotherfield.fieldname] && property[field.fieldname][anotherfield.fieldname].length > 0 ? property[field.fieldname][anotherfield.fieldname] : [];
            var newids =[]
            ids.forEach((id)=>{
              newids.push(ObjectID(id))
            })

            var schemaname = anotherfield.form.apiurl.replace("/filter", '');
            var result = await db.collection(schemaname).find({ "_id": { $in: newids } }).toArray()
            formdata.property[field.fieldname][anotherfield.fieldname] = result;
          }
        }

      }

    }

  }
  if (client) client.close();
  //console.log("5")
  return formdatas;

}

async function populateproductandservices(req) {

  var formid = req.body.formid;
  var fields = await Formfield.find({ formid:  formid})
  var formdatas = [req.body];

  req.body.formfield = fields;
  req.body.amount = 0;
  req.body.totalamount = 0;
  req.body.discount = 0;
  req.body.taxamount = 0;
  req.body.assets = [];


  var client = await MongoClient.connect(url);

  var db = client.db();

  for (var i = 0; i < formdatas.length; i++) {

    var formdata = formdatas[i]
    var property = formdata.property;

    for (var j = 0; j < fields.length; j++) {

      var field = fields[j];

      if (field.fieldtype == "group") {

        var anotherfields = field.fields;
        for (var k = 0; k < anotherfields.length; k++) {

          var anotherfield = anotherfields[k];

          if (anotherfield.fieldtype == "form") {

            var ids= property[field.fieldname][anotherfield.fieldname] && property[field.fieldname][anotherfield.fieldname].length > 0 ? property[field.fieldname][anotherfield.fieldname] : [];
            var newids =[]
            ids.forEach((id)=>{
              newids.push(ObjectID(id))
            })

            var schemaname = anotherfield.form.apiurl.replace("/filter", '');
            var result = await db.collection(schemaname).find({ "_id": { $in: newids } }).toArray()

            if(!req.body.items) {
              req.body.items = []
            }

            if(!req.body.services) {
              req.body.services = []
            }

            if(result && result.length > 0) {

              for (var l = 0; l < result.length; l++) {

                if(schemaname == "billitems" ) {

                  let product = {
                    item: result[l],
                    itemid: result[l]._id,
                    sale: result[l].sale,
                    quantity: 1,
                    taxes : result[l].sale && result[l].sale.taxes ? result[l].sale.taxes : [],
                    cost: result[l].sale && result[l].sale.rate ? result[l].sale.rate : 0,
                    taxamount: 0,
                    totalcost: result[l].sale && result[l].sale.rate ? result[l].sale.rate : 0,
                    discount: result[l].sale && result[l].sale.discount ? result[l].sale.discount : 0,
                  }

                  req.body.amount = req.body.amount + result[l].sale && result[l].sale.rate ? result[l].sale.rate : 0;
                  req.body.totalamount = req.body.totalamount + result[l].sale && result[l].sale.rate ? result[l].sale.rate : 0;


                  req.body.items.push(product);

                } else if (schemaname == "services" ) {

                  let service = {
                    refid: result[l],
                    taxes : result[l].taxes ? result[l].taxes : [],
                    cost: result[l].charges,
                    taxamount: 0,
                    totalcost: result[l].charges,
                    discount: 0,
                  }
                  req.body.amount = req.body.amount + result[l].charges ? result[l].charges : 0;
                  req.body.totalamount = req.body.totalamount + result[l].charges ? result[l].charges : 0;

                  req.body.services.push(service)

                }


              }
            }
          }
        }

      }

    }

  }
  if (client) client.close();
  //console.log("5")
  return formdatas;

}

// async function updateInspetion(req) {
//   var Id = req.body.inspectionid;
//   var formdata = await Formdata.findById(Id);
//   var original = formdata.toObject();

//   req.body.property.quotationid = req.body.quotationid ? req.body.quotationid : undefined
//   req.body.property.joborderid = req.body.joborderid ? req.body.joborderid : undefined

//   if (req.body.property) formdata.property = req.body.property

//   return await formdata.save(req);
// }

async function workshopupdate(req, res) {

  var appointmentid = req.body.appointmentid ? req.body.appointmentid : undefined;
  var inspectionid  = req.body.inspectionid ? req.body.inspectionid : undefined;;
  var quotationid = req.body.quotationid ? req.body.quotationid : undefined;
  var joborderid = req.body.joborderid ? req.body.joborderid : undefined;

  var postData = {
    "property.appointmentid": appointmentid, 
    "property.inspectionid": inspectionid, 
    "property.quotationid": quotationid, 
    "property.joborderid": joborderid
  };

  // console.log("postData", postData);

  if(appointmentid) 
    await Appointment.findByIdAndUpdate(appointmentid, { "$set": postData}).then()

  if(inspectionid) 
    await Formdata.findByIdAndUpdate(inspectionid, { "$set": postData}).then()

  if(quotationid) 
    await Quotation.findByIdAndUpdate(quotationid, { "$set": postData}).then()

  if(joborderid) 
    await Joborder.findByIdAndUpdate(joborderid, { "$set": postData}).then()

  return res.json(postData)
}

async function validatedata(req, res, next) {

  var property = req.body.property; 

  if (property)
  {
    Formfield.find({ "$or": [{ formid: req.body.formid }, { formname: req.body.formname }] })
      .then((fields) => {

        // console.log("fields", fields)

          fields.forEach(function (field) {

            var value = req.body.property[field.fieldname];
            var fielddisplayname = field.displayname ? field.displayname : field.fieldname;

            if(value) {
              var errors = [];
              value = new Date(value);

              if(field.validations && field.validations.length > 0) {
                
                field.validations.forEach(function (validation) {
                  
                  if(validation.year && validation.year.gte) {
                    var years = moment().diff(value, 'years');
                    if(validation.year.gte > years ) {
                      errors.push(`${fielddisplayname} should be greater then ${validation.year.gte} years`)
                    }
                  } 

                  else if (validation.date && validation.date.refdate && validation.date.criteria) {
                    var refvalue = req.body.property[validation.date.refdate];
                    if(refvalue) {
                      
                      refvalue = new Date(refvalue);

                      if ((Date.parse(refvalue) < Date.parse(value))) {
                        var reffielddisplayname = validation.date.refdate;

                        var refFieldObj = fields.find(p=>p.fieldname == validation.date.refdate);
                        if(refFieldObj) {
                          reffielddisplayname = refFieldObj.displayname ? refFieldObj.displayname : refFieldObj.fieldname;
                        }

                        errors.push((reffielddisplayname + " should be greater than " + fielddisplayname));
                      }
                      
                    }
                  }
                });
              }
              
              if(errors && errors.length > 0) {
                var message;
                
                if (errors.length = 1) {
                  message = errors.toString()
                } else {
                  message = errors.join(' and ')
                }
                next(new Error(message))
                return;
              }
            }

          });        
        next();
      })
  }
  else next();
}

async function convertdatatype(req, res, next) {

  var property = req.body.property;


  if (property) {
    Formfield.find({ "$or": [{ formid: req.body.formid }, { formname: req.body.formname }] })

      .then((fields) => {

        fields.forEach(function (field) {
          if (field.fieldtype == "datepicker" && property[field.fieldname]) {
            var date = new Date(property[field.fieldname]);
            property[field.fieldname] = date;
          }
          if (field.fieldtype == "number" && property[field.fieldname]) {
            property[field.fieldname] = parseFloat(property[field.fieldname]);
          }
          if (field.fieldtype == "form" && field.form.formfield == "_id" && !field.multiselect && property[field.fieldname]) {
            property[field.fieldname] = ObjectID(property[field.fieldname])
          }
          if ((field.fieldtype == "form_multiselect" || (field.fieldtype == "form" && field.multiselect)) && property[field.fieldname]) {
            var arr = property[field.fieldname];
            var newarry = [];
            arr.forEach(function (obj) {
              newarry.push(ObjectID(obj));
            })
            property[field.fieldname] = newarry;
          }
        });
        req.body.property = property;

        next();
      })
  }
  else next();
}

async function patch(Id, req) {
  var formdata = await Formdata.findById(Id);
  var original = formdata.toObject();
  if (req.body.addedby) formdata.addedby = req.body.addedby
  if (req.body.property) formdata.property = req.body.property
  if  (req.body.contextid)  formdata.contextid = req.body.contextid 
  if  (req.body.onModel)  formdata.onModel = req.body.onModel
  if  (req.body.status)  formdata.status = req.body.status
  return await formdata.save(req);
}

async function update(Id, req) {
  var formdata = await Formdata.findById(Id);
  var original = formdata.toObject();
  formdata.property = req.body.property
  formdata.contextid = req.body.contextid
  formdata.onModel = req.body.onModel
  formdata.status = req.body.status
  formdata._original = original;
  
  if (formdata.property['signed']){
    formdata.property['acknowledged'] = true
  }
  return await formdata.save(req);
}

async function remove(Id, req) {
  var formdata = await Formdata.findById(Id);
  formdata.status = "deleted"
  return await formdata.save(req);
}

async function filter(req) {
  return await Formdata.getbyfilter(req)
}

async function findcount(params) {
  return await Formdata.findcount(params)
}

async function exportdata(params) {
  return await Formdata.exportdata(params)
}

async function removeall(req) {
  Formdata.deleteMany({ formid: req.formid }).then()
  return { "message": 'formdata Deleted!'};
}

async function synsuprauser(req) {

  var userid = req.body.property.user_id;
  var body = req.body;
  var onModel = body.onModel ? body.onModel : body.property.onModel;

  var formdata = await Formdata.findOne({ "property.user_id": userid, "formid": "61bc4b5ea83abc37b4376681" })

  if (formdata) {
    return await Formdata.findByIdAndUpdate(formdata._id, { "$set": { "property": req.body.property } })
  }
  else {
    var formdata = {
      formid: body.formid,
      property: body.property,      
      onModel: onModel,
    }

    await Joi.validate(formdata, formdataSchema, { abortEarly: false });
    return await new Formdata(formdata).save(req);
  }
}



