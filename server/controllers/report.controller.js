// const bcrypt = require('bcrypt');
const Joi = require('joi');
const Report = require('../models/report.model');
const Formlist = require('../models/formlist.model');
const Form = require('../models/form.model');
const Reportview = require('../views/report.view');
const axios = require('axios')
const createHTML = require('../helpers/createHTML');

const reportSchema = Joi.object({
  title: Joi.string().required(),
  formid: Joi.string().hex().required(),
  category: Joi.string().required(),
  listurl: Joi.object(),
  filterfields: Joi.array(),
  selectfields: Joi.array(),
  sortfields: Joi.array(),
  property: Joi.object()
})


module.exports = {
  insert,
  update,
  patch,
  remove,
  filter,
  filterview,
  findcount,
  findbyId,
  exportdata,
  reportview
}

async function findbyId(Id) {
  return await Report.findById(Id);
}

async function insert(req) {
  var report = {
    title: req.body.title,
    formid: req.body.formid,
    category: req.body.category,
    property: req.body.property
  }
  var form = await Form.findById(report.formid);
  var formlist = await Formlist.findOne({ formname: form.formname });
  report.listurl = form.listurl;
  report.filterfields = formlist.filterfields;
  report.selectfields = formlist.selectfields;
  report.sortfields = formlist.sortfields;
  report = await Joi.validate(report, reportSchema, { abortEarly: false });
  return await new Report(report).save(req);
}

async function patch(Id, req) {
  var report = await Report.findById(Id);
  report._original = report.toObject();
  if (req.body.selectfields) report.selectfields = req.body.selectfields;
  if (req.body.filterfields) report.filterfields = req.body.filterfields;
  if (req.body.sortfields) report.sortfields = req.body.sortfields;
  return await report.save(req);
}

async function update(Id, req) {
  var report = await Report.findById(Id);
  report._original = report.toObject();
  report.title = req.body.title,
  report.formid = req.body.formid,
  report.category = req.body.category,
  report.selectfields = req.body.selectfields,
  report.filterfields = req.body.filterfields,
  report.sortfields = req.body.sortfields,
  report.summaryfields = req.body.summaryfields,
  report.property = req.body.property
  return await report.save(req);
}

async function remove(Id, req) {
  var report = await Report.findById(Id);
  report.status = "deleted"
  return await report.save(req);
}

async function filter(params) {
  var permission  = params.authkey.role.reportpermissions;
  var search = []
  if (permission && permission.length > 0) {

    var searchobj = {
      searchfield: "_id",
      searchvalue: permission,
      datatype: "ObjectId",
      criteria: "in"
    }
    search.push(searchobj)
    params.search = search;
    return await Report.getbyfilter(params)
  }
  else {
    return []
  }
}

async function filterview(params) {
  return await Reportview.getfilterview(params)
}


async function findcount(req) {
  return await Report.findcount(req)
}

async function exportdata(params) {
  return await Report.exportdata(params)
}

async function reportview(req, res) {
  var schemaname = req.body.report.formid.schemaname;
  var formname = req.body.report.formid.formname;
  var formid = req.body.report.formid._id;
  var branch = req.body.authkey.branchid;
  var search = [];

  if (req.body.search && req.body.search.length > 0){
    search = req.body.search
  }
  else if (req.body.report.search){
    search = req.body.report.search
  }
  else {
    search = []
  }

  search.forEach((datesearch)=>{
      if (datesearch.datatype == 'Date')
      {
          var gte = datesearch.searchvalue["$gte"];
          var lte = datesearch.searchvalue["$lte"];
          if (gte.toString()==lte.toString()){
            var date = new Date(gte);
            date.setHours(0, 0, 0, 0);
            datesearch.searchvalue["$gte"] = date;
            date = new Date(lte);
            date.setHours(23, 59, 59, 0);
            datesearch.searchvalue["$lte"] = date;
          }
      }
  })

  if (schemaname == "formdatas"){
    search.push({ searchfield: "formid", searchvalue: formid, datatype: "ObjectId", criteria: "eq" })
  }

  axios.defaults.headers = req.headers;
  var host = req.protocol;
  if (req.headers.host == "app.membroz.com") {
    host = "https://" + req.headers.host;
  }
  else {
    host = req.protocol + "://" + req.headers.host;
  }
  var url = host + "/api/" + schemaname + "/filter";
  const https = require("https");
  // At request level
  const agent = new https.Agent({
    rejectUnauthorized: false
  });

  return axios
  .post(url, {
    search,
    formname: formname
  }, { httpsAgent: agent })
  .then(processdata => {

    var fields =[];
    req.body.report.selectfields.forEach(field => {

      if (field.isDisplayOnList){
        fields.push(field)
      }

    })
    //console.log("processdata.data", processdata.data)
    // //console.log("fields", fields)
    if (req.body.export) {
      req.body.select = fields;
      return processdata.data;
    }
    else return { content: createHTML.getreporthtml(req.body.report, fields, processdata.data, branch) }

  })
  .catch(error => {
    console.error("error", error)
  })

}
