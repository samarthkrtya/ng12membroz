const express = require('express');
const asyncHandler = require('express-async-handler');
const userCtrl = require('../controllers/user.controller');
const formfieldCtrl = require('../controllers/formfield.controller');
const serviceCtrl = require('../controllers/service.controller');
const commonCtrl = require('../controllers/common.controller');
const formdataCtrl = require('../controllers/formdata.controller');
const preprocess = require('../middleware/preprocess');
const dashboardCtrl = require('../controllers/dashboard.controller');
const router = express.Router();
module.exports = router;

router.route('/')
  .post(asyncHandler(preprocess.processUser), asyncHandler(convertdatatype), asyncHandler(insert));
// router.route('/viewprofile/:Id')
//   .get(asyncHandler(viewprofile))

router.route('/:Id')
  .put(asyncHandler(convertdatatype), asyncHandler(update))
  .patch(asyncHandler(patch), asyncHandler(updateserviceavailability))
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

router.route('/filter/wallet/view')
 .post(asyncHandler(walletfilterview))

router.route('/viewcalendar/filter')
  .post(asyncHandler(viewcalendar), asyncHandler(commonCtrl.viewcalendar))

router.route('/viewprofile/:formname/:Id')
  .get(asyncHandler(viewprofile), asyncHandler(getformfields))

router.route('/viewattendance/filter')
  .post(asyncHandler(viewattendance), asyncHandler(commonCtrl.viewcalendar))


router.route('/view/filter')
  .post(asyncHandler(findcount), asyncHandler(viewfilter), commonCtrl.exportcsv)

router.route('/search/')
  .post(asyncHandler(filter),  commonCtrl.deepobjectsearch_like);

router.route('/changepassword')
  .post(userCtrl.updateuserpassword);


async function getformfields(req, res) {
  var formname = req.params.formname;
  let fields = await formfieldCtrl.getformfields(req, formname);
  res.json(fields);
}

async function viewprofile(req, res, next) {
  let user = await userCtrl.viewprofile(req.params.Id);
  req.body.profile = user;
  next()
}

async function walletfilterview(req, res, next) {
  let wallet = await userCtrl.walletfilterview(req.body);
  res.json(wallet);
}

async function findbyId(req, res) {
  let user = await userCtrl.findbyId(req.params.Id);
  res.json(user);
}

async function convertdatatype(req, res, next) {
  req.body.formid = "598998cb6bff2a0e50b3d793";
  await formdataCtrl.convertdatatype(req, res, next);
}

async function insert(req, res) {

  req.body.role = req.body.property.roleid ? req.body.property.roleid : req.body.role
  req.body.designationid = req.body.property.designationid ? req.body.property.designationid : req.body.designationid

  let user = await userCtrl.insert(req);
  res.json(user);
}

async function patch(req, res, next) {
  let user = await userCtrl.patch(req.params.Id, req);
  req.body.user = user
  if (req.body.forcelogin) {
    return res.json(user);
  }
  else next();
}

async function updateserviceavailability(req, res) {
  let user = await serviceCtrl.updateserviceavailability(req);
  res.json(user);
}


async function update(req, res, next) {
  let user = await userCtrl.update(req.params.Id, req);
  res.json(user);
}

async function remove(req, res) {
  let user = await userCtrl.remove(req.params.Id, req);
  res.json(user);
}

async function findcount(req, res, next) {
  if (req.body.size){

    if (req.body.webpartid) {
      let ids = await dashboardCtrl.webpartfilter(req);
      req.body.search = [{ "searchfield": "_id", "searchvalue": ids, "datatype": "ObjectId", "criteria": "in" }]
    }

    await userCtrl.findcount(req);
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

  req.body.formname = req.body.formname? req.body.formname: "user";
  let users = await userCtrl.filter(req.body);
  if (req.body.export) {
    req.body.data = users
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = users
    next()
  }
  else res.json(users);
}

async function viewcalendar(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "user";
  let appointments = await userCtrl.viewcalendar(req.body);
  req.body.data = appointments;
  next();
}

async function viewattendance(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "user";
  let userattendaces = await userCtrl.viewattenance(req.body);
  req.body.data = userattendaces;
  next();
}

async function acivityfilterview(req, res, next) {
  let timelines = await userCtrl.acivityfilterview(req.body);
  res.json(timelines);
}

async function communicationfilterview(req, res, next) {
  let logs = await userCtrl.communicationfilterview(req.body);
  res.json(logs);
}

async function timelinefilterview(req, res, next) {
  let timelines = await userCtrl.timelinefilterview(req.body);
  res.json(timelines);
}


async function viewfilter(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "user";
  var viewname = req.body.viewname;
  let users;
  if (viewname) {
    users = await commonCtrl.viewfilter(req, res);
  }
  else {
    users = await userCtrl.viewfilter(req.body);
  }

  if (req.body.export) {
    req.body.data = users
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = users
    next()
  }
  else res.json(users);
}

async function checklicense(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "user";
  let user = await userCtrl.userview(req.body);
  res.json(user);
}
