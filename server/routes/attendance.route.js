const express = require('express');
const asyncHandler = require('express-async-handler');
const attendanceCtrl = require('../controllers/attendance.controller');
const commonCtrl = require('../controllers/common.controller');
const router = express.Router();
module.exports = router;

router.route('/')
  .post(asyncHandler(insert))

router.route('/attendancelog')
  .post(attendanceCtrl.logattendance)
  .get(attendanceCtrl.getnextsyncid)


router.route('/insertmultiple')
  .post(asyncHandler(insertmultiple))  
  
router.route('/deletemultiple')
  .post(asyncHandler(deletemultiple))  

router.route('/:Id')
  .put(asyncHandler(update))
  .patch(asyncHandler(patch))
  .delete(asyncHandler(remove))
  .get(asyncHandler(findbyId))

router.route('/filter')
  .post(asyncHandler(findcount), asyncHandler(filter), commonCtrl.exportcsv)

router.route('/filter/view')
  .post(asyncHandler(filterview))

router.route('/view/filter')
  .post(asyncHandler(findcount), asyncHandler(viewfilter), commonCtrl.exportcsv)

router.route('/search/')
  .post(asyncHandler(filter),  commonCtrl.deepobjectsearch_like);

async function findbyId(req, res) {
  let attendance = await attendanceCtrl.findbyId(req.params.Id);
  if (attendance && !attendance.property){
    var property = {
      "checkin" : attendance.checkin,
      "checkout" : attendance.checkout,
      "attendancedate" : attendance.checkin
    }
    attendance.property = property;
  }
  res.json(attendance);
}

async function insert(req, res) {
  let attendance = await attendanceCtrl.insert(req);
  res.json(attendance);
}

async function insertmultiple(req, res) {
  let attendance = await attendanceCtrl.insertmultiple(req);
  res.json(attendance);
}    

async function deletemultiple(req, res) {
  let attendance = await attendanceCtrl.deletemultiple(req.params.Id,req);
  res.json(attendance);
}

async function update(req, res) {
  let attendance = await attendanceCtrl.update(req.params.Id, req);
  res.json(attendance);
}

async function patch(req, res) {
  let attendance = await attendanceCtrl.patch(req.params.Id, req);
  res.json(attendance);
}

async function remove(req, res) {
  let attendance = await attendanceCtrl.remove(req.params.Id, req);
  res.json(attendance);
}

async function findcount(req, res, next) {
  if (req.body.size){
    await attendanceCtrl.findcount(req);
    res.header("access-control-expose-headers", "error, totalPages, totalCount");
    res.setHeader("error", req.header.error);
    res.setHeader("totalPages", req.header.totalPages);
    res.setHeader("totalCount", req.header.totalCount);
    next();
  }
  else next()
}

async function filter(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "attendance";
  let attendances = await attendanceCtrl.filter(req.body);
  if (req.body.export) {
    req.body.data = attendances
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = attendances
    next()
  }
  else res.json(attendances);
}

async function filterview(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "attendance";
  let attendances = await attendanceCtrl.filterview(req.body);
  res.json(attendances);
}


async function viewfilter(req, res, next) {

  req.body.formname = req.body.formname? req.body.formname: "attendance";
  var viewname = req.body.viewname;
  let attendances;
  if (viewname) {
    attendances = await commonCtrl.viewfilter(req, res);
  }
  else {
    attendances = await attendanceCtrl.viewfilter(req.body);
  }
  if (req.body.export) {
    req.body.data = attendances
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = attendances
    next()
  }
  else res.json(attendances);
}