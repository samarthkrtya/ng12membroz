const express = require('express');
const asyncHandler = require('express-async-handler');
const accountheadCtrl = require('../controllers/accounthead.controller');
const analyticsreportCtrl = require('../controllers/analyticsreport.controller');
const commonCtrl = require('../controllers/common.controller');
const router = express.Router();
module.exports = router;

router.route('/')
  .post(asyncHandler(insert))

router.route('/:Id')
  .put(asyncHandler(update))
  .delete(asyncHandler(remove))
  .get(asyncHandler(findbyId))

router.route('/financereport/:reporttype')
  .post(asyncHandler(accountheadCtrl.getreporthead), asyncHandler(analyticsreportCtrl.getaccounttxnsummary), asyncHandler(analyticsreportCtrl.getnetprofitloss));

router.route('/filter')
  .post(asyncHandler(findcount), asyncHandler(filter), commonCtrl.exportcsv)

router.route('/search/')
  .post(asyncHandler(filter),  commonCtrl.deepobjectsearch_like);

async function findbyId(req, res) {
  let saleschannelteam = await accountheadCtrl.findbyId(req.params.Id);
  res.json(saleschannelteam);
}

async function insert(req, res) {
  let saleschannelteam = await accountheadCtrl.insert(req);
  res.json(saleschannelteam);
}

async function update(req, res) {
  let saleschannelteam = await accountheadCtrl.update(req.params.Id, req);
  res.json(saleschannelteam);
}

async function remove(req, res) {
  let saleschannelteam = await accountheadCtrl.remove(req.params.Id, req);
  res.json(saleschannelteam);
}

async function findcount(req, res, next) {
  if (req.body.size){
    await accountheadCtrl.findcount(req);
    res.header("access-control-expose-headers", "error, totalPages, totalCount");
    res.setHeader("error", req.header.error);
    res.setHeader("totalPages", req.header.totalPages);
    res.setHeader("totalCount", req.header.totalCount);
    next();
  }
  else next()
}

async function filter(req, res, next) {  
  req.body.formname = req.body.formname? req.body.formname: "accounthead";  
  let accountheads = await accountheadCtrl.filter(req.body);
  if (req.body.export) {
    req.body.data  = accountheads;
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data  = accountheads;
    next()
  }
  else res.json(accountheads);
}

