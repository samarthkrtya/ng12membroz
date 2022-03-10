const express = require('express');
const asyncHandler = require('express-async-handler');
const commonCtrl = require('../controllers/common.controller');
const Historyview = require('../views/histrory.view');
const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))

router.route('/view/filter')
  .post(asyncHandler(viewfiltercount), asyncHandler(viewfilter), commonCtrl.exportcsv)

router.route('/filter/view')
  .post(asyncHandler(viewfiltercount), asyncHandler(filterview))

router.route('/search')
  .post(asyncHandler(viewfilter), commonCtrl.deepobjectsearch_like, commonCtrl.exportcsv)
// router.route('/search/')
//   .post(asyncHandler(filter),  commonCtrl.deepobjectsearch_like);

// async function findcount(req, res, next) {
//   if (req.body.size){
//     await historyCtrl.findcount(req);
//     res.header("access-control-expose-headers", "error, totalPages, totalCount");
//     res.setHeader("error", req.header.error);
//     res.setHeader("totalPages", req.header.totalPages);
//     res.setHeader("totalCount", req.header.totalCount);
//     next();
//   }
//   else next()
// }
async function viewfiltercount(req, res, next) {  
  if (req.body.size) {
    req.body.formname = req.body.formname ? req.body.formname : "history";
    var viewname = req.body.viewname;
    let historyes;
    if (viewname) {
      historyes = await commonCtrl.viewfiltercount(req, res);
    }
    res.header("access-control-expose-headers", "error, totalPages, totalCount");
    res.setHeader("error", req.header.error);
    res.setHeader("totalPages", req.header.totalPages);
    res.setHeader("totalCount", req.header.totalCount);
    next();
  }
  else next()
}

async function viewfilter(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "history";
  req.body.viewname = req.body.viewname ? req.body.viewname : "timelineviews";
  let historyes;
  historyes = await commonCtrl.viewfilter(req, res);
  if (req.body.export) {
    req.body.data = historyes
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = historyes
    next()
  }
  else res.json(historyes);
}

async function filterview(req, res, next) {
  let history =  await Historyview.getfilterview(req.body);
  res.json(history);
}

