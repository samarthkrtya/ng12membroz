const express = require('express');
const asyncHandler = require('express-async-handler');
const enquiryCtrl = require('../controllers/enquiry.controller');
const commonCtrl = require('../controllers/common.controller');
const formdataCtrl = require('../controllers/formdata.controller');
const dashboardCtrl = require('../controllers/dashboard.controller');
const router = express.Router();
module.exports = router;

router.route('/')
  .post(asyncHandler(convertdatatype), asyncHandler(insert))

router.route('/:Id')
  .put(asyncHandler(convertdatatype), asyncHandler(update))
  .patch(asyncHandler(patch))
  .delete(asyncHandler(remove))
  .get(asyncHandler(findbyId))

router.route('/filter')
  .post(asyncHandler(findcount), asyncHandler(filter), commonCtrl.exportcsv)

router.route('/filter/activity/view')
  .post(asyncHandler(acivityfilterview))

router.route('/filter/communication/view')
  .post(asyncHandler(communicationfilterview))

router.route('/filter/timeline/view')
  .post(asyncHandler(timelinefilterview))

router.route('/filter/view')
  .post(asyncHandler(filterview))

router.route('/updatemultienquiries')
  .post(asyncHandler(enquiryCtrl.updatemultienquiries))

router.route('/updateenquiries')
  .post(asyncHandler(enquiryCtrl.updateenquiries))

router.route('/search/')
  .post(asyncHandler(filter),  commonCtrl.deepobjectsearch_like);

async function findbyId(req, res) {
  let enquiry = await enquiryCtrl.findbyId(req.params.Id);
  res.json(enquiry);
}

async function insert(req, res) {
  let enquiry = await enquiryCtrl.insert(req);
  res.json(enquiry);
}

async function update(req, res) {
  let enquiry = await enquiryCtrl.update(req.params.Id, req);
  res.json(enquiry);
}

async function patch(req, res) {
  let enquiry = await enquiryCtrl.patch(req.params.Id, req);
  res.json(enquiry);
}

async function remove(req, res) {
  let enquiry = await enquiryCtrl.remove(req.params.Id, req);
  res.json(enquiry);
}

async function convertdatatype(req, res, next) {
  req.body.formid = "59f430a7bd4e4bb2fb72ec7d";
  await formdataCtrl.convertdatatype(req, res, next);
}

async function findcount(req, res, next) {
  if (req.body.size){
    if (req.body.webpartid) {
      let ids = await dashboardCtrl.webpartfilter(req);
      req.body.search = [{ "searchfield": "_id", "searchvalue": ids, "datatype": "ObjectId", "criteria": "in" }]
    }
    await enquiryCtrl.findcount(req);
    res.header("access-control-expose-headers", "error, totalPages, totalCount");
    res.setHeader("error", req.header.error);
    res.setHeader("totalPages", req.header.totalPages);
    res.setHeader("totalCount", req.header.totalCount);
    next();
  }
  else next()
}

async function filter(req, res, next) {
  if (req.body.webpartid) {
    let ids = await dashboardCtrl.webpartfilter(req);
    req.body.search = [{ "searchfield": "_id", "searchvalue": ids, "datatype": "ObjectId", "criteria": "in" }]
  }
  req.body.formname = req.body.formname? req.body.formname: "promotion";
  let enquiries = await enquiryCtrl.filter(req.body);
  if (req.body.export) {
    req.body.data = enquiries
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = enquiries
    next()
  }
  else res.json(enquiries);
}

async function filterview(req, res, next) {
  let enquiries = await enquiryCtrl.filterview(req.body);
  res.json(enquiries);
}

async function acivityfilterview(req, res, next) {
  let timelines = await enquiryCtrl.acivityfilterview(req.body);
  res.json(timelines);
}

async function communicationfilterview(req, res, next) {
  let logs = await enquiryCtrl.communicationfilterview(req.body);
  res.json(logs);
}

async function timelinefilterview(req, res, next) {
  let timelines = await enquiryCtrl.timelinefilterview(req.body);
  res.json(timelines);
}

