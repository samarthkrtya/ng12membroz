const express = require('express');
const asyncHandler = require('express-async-handler');
const formlistCtrl = require('../controllers/formlist.controller');
const commonCtrl = require('../controllers/common.controller');

const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))

router.route('/')
  .post(asyncHandler(insert))

router.route('/:Id')
  .put(asyncHandler(update))
  .patch(asyncHandler(patch))
  .get(asyncHandler(findbyId))

router.route('/filter')
  .post(asyncHandler(findcount), asyncHandler(filter), commonCtrl.exportcsv)

router.route('/view/filter/')
  .post(asyncHandler(findcount), asyncHandler(filterview), commonCtrl.exportcsv)

async function findbyId(req, res) {
  let formlist = await formlistCtrl.findbyId(req.params.Id);
  res.json(formlist);
}

async function insert(req, res) {
  let formlist = await formlistCtrl.insert(req);
  res.json(formlist);
}

async function update(req, res) {
  let formlist = await formlistCtrl.update(req.params.Id, req);
  res.json(formlist);
}

async function patch(req, res) {
  let formlist = await formlistCtrl.patch(req.params.Id, req);
  res.json(formlist);
}

async function filterview(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "formlist";
  let formlists = await formlistCtrl.filterview(req.body);
  if (req.body.export) {
    req.body.data = formlists
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = formlists
    next()
  }
  else res.json(formlists);
}

async function filter(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "formlist";
  let formlists = await formlistCtrl.filter(req.body);
  if (req.body.export) {
    req.body.data = formlists
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = formlists
    next()
  }
  else res.json(formlists);
}

async function findcount(req, res, next) {
  if (req.body.size){
    await formlistCtrl.findcount(req);
    res.header("access-control-expose-headers", "error, totalPages, totalCount");
    res.setHeader("error", req.header.error);
    res.setHeader("totalPages", req.header.totalPages);
    res.setHeader("totalCount", req.header.totalCount);
    next();
  }
  else next()
}
