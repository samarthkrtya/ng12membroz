const Joi = require('joi');
const Expense = require('../models/expense.model');

const expenseSchema = Joi.object({
  vouchernumber: Joi.number().required(),
  prefix: Joi.string().required(),
  expenseaccount: Joi.string().hex().required(),
  date: Joi.date().required(),
  remark: Joi.string(),
  amount: Joi.number().required(),
  paidthrough: Joi.string().hex(),
  // vendorid: Joi.string().hex(),
  attachments: Joi.array(),
  property: Joi.object()
})

module.exports = {
  insert,
  update,
  remove,
  filter,
  findcount,
  findbyId,
  exportdata,
  getnextdocnumber
}

async function findbyId(Id) {
  return await Expense.findById(Id);
}

async function insert(req) {
  var body = req.body;
  var expense = {
    vouchernumber: body.vouchernumber,
    prefix: body.prefix,
    expenseaccount: body.expenseaccount,
    date: body.date,
    remark: body.remark,
    amount: body.amount,
    paidthrough: body.paidthrough,
    // vendorid: body.vendorid,
    property: body.property,
    attachments: body.attachments
  }
  await Joi.validate(expense, expenseSchema, { abortEarly: false });
  return await new Expense(expense).save(req);
}

async function update(Id, req) {

  var body = req.body;
  var expense = await Expense.findById(Id);
  expense._original = expense.toObject();
  expense.expenseaccount = body.expenseaccount,
  expense.date = body.date,
  expense.remark = body.remark,
  expense.amount = body.amount,
  expense.paidthrough = body.paidthrough,
  // expense.vendorid = body.vendorid,
  expense.attachments = body.attachments
  expense.property = body.property
  return await expense.save(req);

}

async function remove(Id, req) {
  var expense = await Expense.findById(Id);
  expense.status = "deleted"
  return await expense.save(req);
}

async function filter(params) {
  return await Expense.getbyfilter(params)
}

async function getnextdocnumber(req, res, next) {

  var branch = req.body.authkey.branchid;
  var prefix = "";

  if (DATABASETYPE == "branchwise") {
    var docformat = branch.docformat;
    prefix = docformat.expense ? docformat.expense["prefix"] : "EX";
  } else {
    var docformat = BILLFORMAT;
    if (docformat)
      prefix = docformat.expense ? docformat.expense["prefix"] : "EX";
  }

  Expense.getnextdocnumber(prefix, branch._id)
    .then((vouchernumber) => {
      req.body.vouchernumber = vouchernumber;
      req.body.prefix = prefix;
      if (!req.body.expenseaccount) return res.json(prefix + "-" + vouchernumber);
      else next();
    })

}

async function findcount(req) {
  return await Expense.findcount(req)
}

async function exportdata(params) {
  return await Expense.exportdata(params)
}
