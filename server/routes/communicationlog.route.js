const express = require('express');
const asyncHandler = require('express-async-handler');
const communicationlogCtrl = require('../controllers/communicationlog.controller');
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


async function findbyId(req, res) {
  let communicationlog = await communicationlogCtrl.findbyId(req.params.Id);
  res.json(communicationlog);
}

async function remove(req, res) {
  let communicationlog = await communicationlogCtrl.remove(req.params.Id, req);
  res.json(communicationlog);
}

async function insert(req, res) {
  let communicationlog = await communicationlogCtrl.insert(req);
  res.json(communicationlog);
}

async function update(req, res) {
  let communicationlog = await communicationlogCtrl.update(req.params.Id, req);
  res.json(communicationlog);
}

async function findcount(req, res, next) {
  if (req.body.size){
    if (req.body.webpartid) {
      let ids = await dashboardCtrl.webpartfilter(req);
      req.body.search = [{ "searchfield": "_id", "searchvalue": ids, "datatype": "ObjectId", "criteria": "in" }]
    }
    await communicationlogCtrl.findcount(req);
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
  req.body.formname = req.body.formname? req.body.formname: "communicationlog";
  let communicationlogs = await communicationlogCtrl.filter(req.body);
  if (req.body.export) {
    req.body.data = communicationlogs
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = communicationlogs
    next()
  }
  else res.json(communicationlogs);
}


