const express = require('express');
const asyncHandler = require('express-async-handler');
const branchCtrl = require('../controllers/branch.controller');
const commonCtrl = require('../controllers/common.controller');
const memberCtrl = require('../controllers/member.controller');
const enquiryCtrl = require('../controllers/enquiry.controller');
const preprocess = require('../middleware/preprocess');
const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))

router.route('/')
  .post(asyncHandler(insert))

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

router.route('/membrozsubscription/')
  .post(asyncHandler(membrozsubscriptionview))

router.route('/freeplansetup')
  .post(branchCtrl.freeplansetup, asyncHandler(preprocess.processMember), asyncHandler(memberinsert))

router.route('/freetrialsetup')
  .post(freetrialsetup, branchCtrl.freeplansetup, asyncHandler(preprocess.processMember), asyncHandler(memberinsert))

router.route('/demorequest')
  .post(demorequest, asyncHandler(branchCtrl.createcontact))

router.route('/generateqrcode/')
  .post(branchCtrl.generateqrcode)

router.route('/generatewebqrcode/')
  .post(branchCtrl.generatewebqrcode)
  


async function demorequest(req, res, next) {
  req.body.property.primaryemail = req.body.property.email;
  req.body.property.mobile = req.body.property.mobile_number;
  req.body.solutiontype = req.body.property.interested;
  let enquiry = await enquiryCtrl.insert(req);
  req.body.contact = enquiry;
  next();
}

async function freetrialsetup(req, res, next) {
  req.body.freetrial = true;
  next();
}

async function memberinsert(req, res) {
  let member = await memberCtrl.insert(req);
  let branch = await branchCtrl.findbyId(req.body.branch._id);
  branch.membrozid = member._id;
  branch.save(req).then()
  res.json(member);
}

async function findbyId(req, res) {
  let branch = await branchCtrl.findbyId(req.params.Id);
  res.json(branch);
}

async function insert(req, res) {
  let branch = await branchCtrl.insert(req);
  res.json(branch);
}

async function patch(req, res) {
  let branch = await branchCtrl.patch(req.params.Id, req);
  res.json(branch);
}

async function update(req, res) {
  let branch = await branchCtrl.update(req.params.Id, req);
  res.json(branch);
}

async function remove(req, res) {
  let branch = await branchCtrl.remove(req.params.Id, req);
  res.json(branch);
}

async function findcount(req, res, next) {
  if (req.body.size){
    await branchCtrl.findcount(req);
    res.header("access-control-expose-headers", "error, totalPages, totalCount");
    res.setHeader("error", req.header.error);
    res.setHeader("totalPages", req.header.totalPages);
    res.setHeader("totalCount", req.header.totalCount);
    next();
  }
  else next()
}

async function filter(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "branch";
  let branches = await branchCtrl.filter(req.body);
  if (req.body.export) {
    req.body.data = branches
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = branches
    next()
  }
  else res.json(branches);
}

async function filterview(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "branch";
  let branches = await branchCtrl.filterview(req.body);
  res.json(branches);
}

async function viewfilter(req, res, next) {

  req.body.formname = req.body.formname? req.body.formname: "branch";
  var viewname = req.body.viewname;
  let branches;
  if (viewname) {
    branches = await commonCtrl.viewfilter(req, res);
  }
  else {
    branches = await userCtrl.viewfilter(req.body);
  }
  if (req.body.export) {
    req.body.data = branches
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = branches
    next()
  }
  else res.json(branches);
}

async function membrozsubscriptionview(req, res, next) {
  console.log(req.body.search)
  req.body.formname = req.body.formname? req.body.formname: "branch";
  let branches = await branchCtrl.membrozsubscriptionview(req.body);
  res.json(branches);
}
