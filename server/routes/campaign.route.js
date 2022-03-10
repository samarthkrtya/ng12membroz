const express = require('express');
const asyncHandler = require('express-async-handler');
const campaignCtrl = require('../controllers/campaign.controller');
const commonCtrl = require('../controllers/common.controller');

const router = express.Router();
module.exports = router;

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

router.route('/search/')
  .post(asyncHandler(filter),  commonCtrl.deepobjectsearch_like);

router.route('/teams/:id')
  .get(asyncHandler(getcampaignteams));

async function findbyId(req, res) {
  let campaign = await campaignCtrl.findbyId(req.params.Id);
  res.json(campaign);
}

async function insert(req, res) {
  let campaign = await campaignCtrl.insert(req);
  res.json(campaign);
}

async function update(req, res) {
  let campaign = await campaignCtrl.update(req.params.Id, req);
  res.json(campaign);
}

async function patch(req, res) {
  let campaign = await campaignCtrl.patch(req.params.Id, req);
  res.json(campaign);
}

async function remove(req, res) {
  let campaign = await campaignCtrl.remove(req.params.Id, req);
  res.json(campaign);
}

async function filterview(req, res, next) {
  let campaigns = await campaignCtrl.filterview(req.body);
  res.json(campaigns);
}

async function findcount(req, res, next) {
  if (req.body.size){
    await campaignCtrl.findcount(req);
    res.header("access-control-expose-headers", "error, totalPages, totalCount");
    res.setHeader("error", req.header.error);
    res.setHeader("totalPages", req.header.totalPages);
    res.setHeader("totalCount", req.header.totalCount);
    next();
  }
  else next()
}

async function filter(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "campaign";
  let campaigns = await campaignCtrl.filter(req.body);
  if (req.body.export) {
    req.body.data = campaigns
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = campaigns
    next()
  }
  else res.json(campaigns);
}

async function getcampaignteams(req, res, next) {
  var id = req.params.id;
  let team = await campaignCtrl.getcampaignteams(id);
  res.json(team);
}
