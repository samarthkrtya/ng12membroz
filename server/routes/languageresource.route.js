const express = require('express');
const asyncHandler = require('express-async-handler');
const languageresourceCtrl = require('../controllers/languageresource.controller');
const commonCtrl = require('../controllers/common.controller');
const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))

router.route('/')
  .post(asyncHandler(insert))

router.route('/:Id')
  .put(asyncHandler(update))
  .get(asyncHandler(findbyId))

router.route('/filter')
.post(asyncHandler(findcount), asyncHandler(filter), commonCtrl.exportcsv)

async function findbyId(req, res) {
  let languageresource = await languageresourceCtrl.findbyId(req.params.Id);
  res.json(languageresource);
}

async function insert(req, res) {
  let languageresource = await languageresourceCtrl.insert(req);
  res.json(languageresource);
}

async function update(req, res) {
  let languageresource = await languageresourceCtrl.update(req.params.Id, req);
  res.json(languageresource);
}

async function filter(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "languageresource";
  let languageresources = await languageresourceCtrl.filter(req.body);
  if (req.body.export) {
    req.body.data = languageresources
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = languageresources
    next()
  }
  else res.json(languageresources);
}

async function findcount(req, res, next) {
  if (req.body.size){
    await languageresourceCtrl.findcount(req);
    res.header("access-control-expose-headers", "error, totalPages, totalCount");
    res.setHeader("error", req.header.error);
    res.setHeader("totalPages", req.header.totalPages);
    res.setHeader("totalCount", req.header.totalCount);
    next();
  }
  else next()
}
