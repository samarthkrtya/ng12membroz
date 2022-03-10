const express = require('express');
const asyncHandler = require('express-async-handler');
const expenseCtrl = require('../controllers/expense.controller');
const commonCtrl = require('../controllers/common.controller');
const router = express.Router();
module.exports = router;

router.route('/')
  .post(asyncHandler(expenseCtrl.getnextdocnumber), asyncHandler(insert))

router.route('/:Id')
  .put(asyncHandler(update))
  .delete(asyncHandler(remove))
  .get(asyncHandler(findbyId))

router.route('/filter')
  .post(asyncHandler(findcount), asyncHandler(filter), commonCtrl.exportcsv)

router.route('/search/')
  .post(asyncHandler(filter),  commonCtrl.deepobjectsearch_like);

router.route('/view/expnumber')
  .get(asyncHandler(expenseCtrl.getnextdocnumber))

async function findbyId(req, res) { 
  let expense = await expenseCtrl.findbyId(req.params.Id);
  res.json(expense);
}

async function insert(req, res) {
  let expense = await expenseCtrl.insert(req);
  res.json(expense);
}

async function update(req, res) {
  let expense = await expenseCtrl.update(req.params.Id, req);
  res.json(expense);
}

async function remove(req, res) {
  let expense = await expenseCtrl.remove(req.params.Id, req);
  res.json(expense);
}

async function findcount(req, res, next) {
  if (req.body.size){
    await expenseCtrl.findcount(req);
    res.header("access-control-expose-headers", "error, totalPages, totalCount");
    res.setHeader("error", req.header.error);
    res.setHeader("totalPages", req.header.totalPages);
    res.setHeader("totalCount", req.header.totalCount);
    next();
  }
  else next()
}

async function filter(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "expense";
  let expenses = await expenseCtrl.filter(req.body);
  if (req.body.export) {
    req.body.data = expenses
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = expenses
    next()
  }
  else res.json(expenses);
}

