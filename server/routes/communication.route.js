const express = require('express');
const asyncHandler = require('express-async-handler');
const communicationCtrl = require('../controllers/communication.controller');
const commonCtrl = require('../controllers/common.controller');
const dashboardCtrl = require('../controllers/dashboard.controller');
const router = express.Router();
module.exports = router;
//router.use(passport.authenticate('jwt', { session: false }))

router.route('/')
  .post(asyncHandler(insert))
router.route('/:Id')
  .put(asyncHandler(update))
  .delete(asyncHandler(remove))
  .get(asyncHandler(findbyId))

router.route('/filter')
  .post(asyncHandler(findcount), asyncHandler(filter), commonCtrl.exportcsv)

router.route('/search/')
  .post(asyncHandler(filter),  commonCtrl.deepobjectsearch_like);

router.route('/send')
  .post(communicationCtrl.sendcommunication);

router.route('/announcement')
  .post(asyncHandler(getrecipients), communicationCtrl.sendannouncement);

async function findbyId(req, res) {
  let communication = await communicationCtrl.findbyId(req.params.Id);
  res.json(communication);
}

async function remove(req, res) {
  let communication = await communicationCtrl.remove(req.params.Id, req);
  res.json(communication);
}

async function insert(req, res) {
  let communication = await communicationCtrl.insert(req);
  res.json(communication);
}

async function update(req, res) {
  let communication = await communicationCtrl.update(req.params.Id, req);
  res.json(communication);
}

async function getrecipients(req, res, next) {
  let recipients = await commonCtrl.contactfilterview(req.body);
  req.body.recipients = recipients;
  next();
}

async function findcount(req, res, next) {
  if (req.body.size){

    if (req.body.webpartid) {
      let ids = await dashboardCtrl.webpartfilter(req);
      req.bo
      dy.search = [{ "searchfield": "_id", "searchvalue": ids, "datatype": "ObjectId", "criteria": "in" }]
    }
    await communicationCtrl.findcount(req);
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

  req.body.formname = req.body.formname? req.body.formname: "communication";
  let communications = await communicationCtrl.filter(req.body);
  if (req.body.export) {
    req.body.data = communications
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = communications
    next()
  }
  else res.json(communications);
}


