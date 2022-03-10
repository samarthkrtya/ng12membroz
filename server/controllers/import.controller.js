import xlsx from 'node-xlsx'
const fs = require('fs');
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var url = process.env.MONGO_HOST;
const Joi = require('joi');
const User = require('../models/user.model');
import async from "async";

module.exports = {
  getheadings,
  getalldata,
  downloadfile,
  getjoivalidator,
  validatedata,
  importdata
}

function getjoivalidator(req, res, next)
{  
  var mapping = req.body.mapping;
  var joiobj = {}
  var propSchema = {}
  mapping.forEach((field)=>{
    var fieldname = field.datafield;
    var datatype = field.datatype;
    datatype = datatype.toLowerCase();
    if (fieldname.indexOf(".")>0){
      let prop = fieldname.split(".")
      if (field.mandatory=="yes")
      {
        switch(datatype) {
          case "text":
            propSchema[prop[1]] = Joi.string().required();
            break;
          case "objectid":
            joiobj[field.datafield] = Joi.string().hex();
            break;
          case "number":
            propSchema[prop[1]] = Joi.number().required();
            break;
          case "mobile":
              propSchema[prop[1]] = Joi.number().required();
              break;
          case "email":
            propSchema[prop[1]] = Joi.string().email().required();
            break;
          default:
            propSchema[prop[1]] = Joi.string().required();
        }
        // //console.log(field)
      }
      else
      {
        switch(datatype) {
          case "text":
            propSchema[prop[1]] = Joi.string();
            break;
          case "objectid":
            joiobj[field.datafield] = Joi.string().hex();
            break;
          case "number":
            propSchema[prop[1]] = Joi.number();
            break;
          case "mobile":
            propSchema[prop[1]] = Joi.number();
            break;
          case "email":
            propSchema[prop[1]] = Joi.string().email();
            break;
          default:
            propSchema[prop[1]] = Joi.string();
        }
      }

    }
    else {
      if (field.mandatory=="yes")
      {
        switch(datatype) {
          case "text":
            joiobj[field.datafield] = Joi.string().required();
            break;
          case "objectid":
            joiobj[field.datafield] = Joi.string().hex();
            break;
          case "number":
            joiobj[field.datafield] = Joi.number().required();
            break;
          case "mobile":
            joiobj[field.datafield] = Joi.number().required();
            break;
          case "email":
            joiobj[field.datafield] = Joi.string().email().required();
            break;
          default:
            joiobj[field.datafield] = Joi.string().required();
        }
      }
      else
      {        
        switch(datatype) {
          case "text":
            joiobj[field.datafield] = Joi.string();
            break;
          case "objectid":
            joiobj[field.datafield] = Joi.string().hex();
            break;
          case "number":
            joiobj[field.datafield] = Joi.number();
            break;
          case "mobile":
            joiobj[field.datafield] = Joi.number()
            break;
          case "email":
            joiobj[field.datafield] = Joi.string().email();
            break;
          default:
            joiobj[field.datafield] = Joi.string();
        }
      }
    }

  })

  joiobj["property"] = Joi.object().keys(propSchema);
  const objectSchema = Joi.object(joiobj)
  next(objectSchema);

}

function downloadfile(req, res, next) {

  const http = require("https");
  var path = req.body.filename;
  var new_filename = guid() + '.' + path.split('.').pop();
  var dir = './uploads/';
  var filepath = dir + new_filename;

  var promise1 = new Promise(function (resolve, reject) {

    if (!fs.existsSync(dir)) {
      fs.mkdir(dir, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    } else {
      resolve();
    }

  });

  promise1.then(function () {
    var file = fs.createWriteStream(filepath);

    http.get(path, response => {

      var stream = response.pipe(file);
      stream.on('finish', function () {
        req.body.filepath = filepath;
        next()
      });

    });
  });


}

async function validatedata(userSchema, req, res, next){

  var errors = [];
  var filepath = req.body.filepath;
  var schemaname = req.body.schemaname;
  var mapping = req.body.mapping;

  try {

    var obj = xlsx.parse(filepath);
    var data = obj[0].data;
    var heading = obj[0].data[0];
    var json = []
    delete data[0];

    data.forEach((row)=>{
      if (row){
        var obj = {}, i=0
        heading.forEach((head)=>{
          obj[head] = row[i]
          i++;
        })
        json.push(obj);       
        
      }
    })
    
    json.forEach(async (row)=>{
      if (row){
        var obj = {}, i=0
        mapping.forEach(async (field)=>{
          var fieldname = field.datafield;
          if (field.datafield && field.datafield != '') {
            if (fieldname.indexOf(".")>0){
              let prop = fieldname.split(".")
              if (!obj[prop[0]]) obj[prop[0]] = {}
              obj[prop[0]][prop[1]] = field.datatype=="String" ? row[field.fieldname].toString() : row[field.fieldname];
            } else {
              obj[fieldname] = field.datatype=="String" ? row[field.fieldname].toString() : row[field.fieldname]
            }
          }
          
          if (fieldname=="membrozid" && schemaname=="attendances"){                            
            var username = row["userid"];
            var object = await User.findOne({ username: username }, { _id: 1 });              
              if (object){
                obj["membrozid"] = object["_id"]
               // console.log(object["_id"])
              }              
          }

        })
        // console.log("obj", obj)
        // //console.log("userSchema", userSchema)
        let joiobj = Joi.validate(obj, userSchema, { abortEarly: true });      
        console.log(joiobj.error)  
        if (joiobj.error) {
          errors.push(joiobj.error);
        }
      }
    })
  } catch (e) {

  } finally {

    fs.unlink(filepath, function (err) {
      if (err) throw err;
      // if no error, file has been deleted successfully
      // //console.log('File deleted!');
    });
    res.json(errors)
  }
}

async function getalldata(req, res, next) {

  var filepath = req.body.filepath;
  var obj = xlsx.parse(filepath);
  var data = obj[0].data;
  var heading = obj[0].data[0];
  var json = []
  delete data[0];
  data.forEach((row)=>{
    if (row){
      var obj = {}, i=0
      if (row && row.length == 0) return;
      heading.forEach((head)=>{
        obj[head] = row[i]
        i++;
      })
      json.push(obj)
    }
  })
  fs.unlink(filepath, function (err) {
    if (err) throw err;
    // if no error, file has been deleted successfully
    // //console.log('File deleted!');
  });
  res.json(json)
}

function getheadings(data, req, res, next) {

  var filepath = req.body.filepath;
  var obj = xlsx.parse(filepath);
  var sheet_headings = obj[0].data[0];

  fs.unlink(filepath, function (err) {
    if (err) throw err;
    // if no error, file has been deleted successfully
    ////console.log('File deleted!');
  });

  res.json({ "heading": sheet_headings, "fields": data });
}

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

async function importdata(userSchema, req, res, next) {
 
    let schemaname = req.body.schemaname;
    var mapping = req.body.mapping;
    var filepath = req.body.filepath;
    var buffer = []
    var branchid = req.body.authkey.branchid._id;
    var addedby = req.body.authkey._id;
    var obj = xlsx.parse(filepath);
    var data = obj[0].data;
    var heading = obj[0].data[0];
    var json = []
    delete data[0];
    
    data.forEach((row)=>{
      if (row){
        var obj = {}, i=0
        heading.forEach((head)=>{
          obj[head] = row[i]
          i++;
        })
        json.push(obj)
      }
    })
    json.forEach((row)=>{
      if (row){
        var obj = {}, i=0
        mapping.forEach((field)=>{
          var fieldname = field.datafield;
          if (!fieldname || fieldname=='') return;
          if (!row[field.fieldname]) return;
          if (fieldname.indexOf(".")>0){
            let prop = fieldname.split(".")
            if (!obj[prop[0]]) obj[prop[0]] = {}
            obj[prop[0]][prop[1]] = row[field.fieldname]
          }
          else {
            if (field.datatype=="Password") {
              obj[fieldname] = row[field.fieldname]
            }
            else {
              obj[fieldname] = row[field.fieldname]
            }
          }

        })
        let joiobj = Joi.validate(obj, userSchema, { abortEarly: true });
        if (!joiobj.error && req.body.rootfield) {


          if(!(Object.keys(req.body.rootfield).length === 0 && req.body.rootfield.constructor === Object))
            for (var attrname in req.body.rootfield)
            {
                // Regular expression to check if string is a valid UUID
                const regexExp = new RegExp("^[0-9a-fA-F]{24}$");
                // String with valid UUID separated by dash
                const str = req.body.rootfield[attrname];
                if (regexExp.test(str))
                {
                  obj[attrname] =  ObjectID(req.body.rootfield[attrname]);
                }
                else obj[attrname] = req.body.rootfield[attrname];
            }
          
        }
        obj.branchid = branchid;
        obj.addedby = addedby;
        obj.createdAt = new Date();
        obj.status = "active";
        buffer.push(obj)

      }
    })

    try {
        var client = await MongoClient.connect(url);
        var db = client.db();
        var result = await db.collection(schemaname).insertMany(buffer, { ordered:false });
        client.close();
        // //console.log(result)
      }
    catch (e) {
      if (e.writeErrors)
        e.writeErrors.forEach(e1 => {
          // //console.log(e1.errmsg)
        })
    }
    finally {
      fs.unlink(filepath, function (err) {
        if (err) throw err;
        // if no error, file has been deleted successfully
        // //console.log('File deleted!');
      });
      res.json(buffer)
    }


}
