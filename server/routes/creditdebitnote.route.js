const express = require('express');
const asyncHandler = require('express-async-handler');
const creditdebitnoteCtrl = require('../controllers/creditdebitnote.controller');
const commonCtrl = require('../controllers/common.controller');
const router = express.Router();
module.exports = router;

router.route('/')
  .post(asyncHandler(creditdebitnoteCtrl.getnextdocnumber),asyncHandler(insert), creditdebitnoteCtrl.updatebillqty )

router.route('/:Id')
  .put(asyncHandler(update))
  .delete(asyncHandler(remove))
  .get(asyncHandler(findbyId))

router.route('/filter')
  .post(asyncHandler(findcount), asyncHandler(filter), commonCtrl.exportcsv)

router.route('/search/')
  .post(asyncHandler(filter),  commonCtrl.deepobjectsearch_like);

router.route('/view/cdnnumber')
  .get(asyncHandler(creditdebitnoteCtrl.getnextdocnumber))

router.route('/findvalidcreditnotes/')
  .post(asyncHandler(findvalidcreditnotes));


async function findbyId(req, res) {
  let creditdebitnote = await creditdebitnoteCtrl.findbyId(req.params.Id);
  res.json(creditdebitnote);
}

async function findvalidcreditnotes(req, res) {
  let creditdebitnote = await creditdebitnoteCtrl.findvalidcreditnotes(req, res);
  res.json(creditdebitnote);
}

async function insert(req, res,next) {
  let creditdebitnote = await creditdebitnoteCtrl.insert(req);
  req.body.creditdebitnote =  creditdebitnote;
  next()
  // res.json(creditdebitnote);
}

async function update(req, res) {
  let creditdebitnote = await creditdebitnoteCtrl.update(req.params.Id, req);
  res.json(creditdebitnote);
}

async function remove(req, res) {
  let creditdebitnote = await creditdebitnoteCtrl.remove(req.params.Id, req);
  res.json(creditdebitnote);
}

async function findcount(req, res, next) {
  if (req.body.size){
    await creditdebitnoteCtrl.findcount(req);
    res.header("access-control-expose-headers", "error, totalPages, totalCount");
    res.setHeader("error", req.header.error);
    res.setHeader("totalPages", req.header.totalPages);
    res.setHeader("totalCount", req.header.totalCount);
    next();
  }
  else next()
}

async function filter(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "creditdebitnote";
  let creditdebitnotes = await creditdebitnoteCtrl.filter(req.body);
  if (req.body.export) {
    req.body.data = creditdebitnotes
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = creditdebitnotes
    next()
  }
  else res.json(creditdebitnotes);
}

