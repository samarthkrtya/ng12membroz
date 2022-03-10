const express = require('express');
const asyncHandler = require('express-async-handler');
const prospectCtrl = require('../controllers/prospect.controller');
const paymentscheduleCtrl = require('../controllers/paymentschedule.controller');
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

router.route('/filter/view')
  .post(asyncHandler(filterview))

router.route('/filter/activity/view')
  .post(asyncHandler(acivityfilterview))

router.route('/filter/communication/view')
  .post(asyncHandler(communicationfilterview))

router.route('/filter/timeline/view')
  .post(asyncHandler(timelinefilterview))

router.route('/filter/wallet/view')
  .post(asyncHandler(walletfilterview), commonCtrl.exportcsv)

  router.route('/filter/usagesummary/view')
  .post(asyncHandler(usagesummaryview))

router.route('/search/')
  .post(asyncHandler(findcount), asyncHandler(filter), commonCtrl.exportcsv);

router.route('/updatepackages')
  .post(asyncHandler(prospectCtrl.updatepackages), asyncHandler(paymentscheduleCtrl.createpaymentschedule));


async function findbyId(req, res) {
  let prospect = await prospectCtrl.findbyId(req.params.Id);
  res.json(prospect);
}

async function insert(req, res) {
  let prospect = await prospectCtrl.insert(req);
  res.json(prospect);
}

async function update(req, res) {
  let prospect = await prospectCtrl.update(req.params.Id, req);
  res.json(prospect);
}

async function patch(req, res) {
  let prospect = await prospectCtrl.patch(req.params.Id, req);
  res.json(prospect);
}

async function remove(req, res) {
  let prospect = await prospectCtrl.remove(req.params.Id, req);
  res.json(prospect);
}

async function walletfilterview(req, res, next) {
  let wallet = await prospectCtrl.walletfilterview(req.body);
  
  if (req.body.export) {
    req.body.data = wallet;
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = wallet;
    next()
  }
  else res.json(wallet);
}

async function convertdatatype(req, res, next) {
  req.body.formid = "5af03fe1dbd19f20e03ac67c";
  await formdataCtrl.convertdatatype(req, res, next);
}

async function findcount(req, res, next) {    
  if (req.body.size){
    if (req.body.webpartid) {
      let ids = await dashboardCtrl.webpartfilter(req);
      req.body.search = [{ "searchfield": "_id", "searchvalue": ids, "datatype": "ObjectId", "criteria": "in" }]
    }

    await prospectCtrl.findcount(req);
    res.header("access-control-expose-headers", "error, totalPages, totalCount");
    //console.log(req.header.totalPages, req.header.totalCount)
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

  req.body.formname = req.body.formname? req.body.formname: "prospect";
  let prospects = await prospectCtrl.filter(req.body);

  if (req.body.export) {
    req.body.data = prospects
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    if (req.body.export) {
      req.body.data = prospects
      next()
    }
    else {
      res.json(prospects);
    }    
  }
  else res.json(prospects);
}

async function filterview(req, res, next) {
  let prospects = await prospectCtrl.filterview(req.body);
  res.json(prospects);
}

async function acivityfilterview(req, res, next) {
  let timelines = await prospectCtrl.acivityfilterview(req.body);
  res.json(timelines);
}

async function communicationfilterview(req, res, next) {
  let logs = await prospectCtrl.communicationfilterview(req.body);
  res.json(logs);
}

async function timelinefilterview(req, res, next) {
  let timelines = await prospectCtrl.timelinefilterview(req.body);
  res.json(timelines);
}

async function usagesummaryview(req, res, next) {
  let usagesummary = await prospectCtrl.usagesummaryview(req.body);
  res.json(usagesummary);
}
