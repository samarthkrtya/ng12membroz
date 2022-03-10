const Joi = require('joi');
const Accounthead = require('../models/accounthead.model');

const accountheadSchema = Joi.object({
  headname: Joi.string().required(),
  accounttype: Joi.string().required(),
  reporthead: Joi.string().required(), 
  cashflowhead: Joi.string(), 
  headaccount: Joi.string().hex().required(),
  secure: Joi.boolean(),
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
  getreporthead
}

async function getreporthead(req, res, next) {

  var reporttype = req.params.reporttype;
  var query = {}
  if (reporttype == "cashflowstatement"){
      query = {
        reporttype: "balancesheet",
        cashflowhead : { 
          "$exists" : true
      }
    }
  }
  else {
    query  = {
      reporttype: reporttype
    }
  }

  Accounthead.find(query)
             .select({ "_id": 1 })
             .then((accountheads) => {
                var heads = [];
                accountheads.forEach(function(e){
                  heads.push(e._id)
                })
                req.body.heads = heads;
                next();

              });

}

async function findbyId(Id) {
  var params = {}
  params.formname = "accounthead";
  params.search = [
    { "searchfield": "_id", "searchvalue": Id, "datatype": "ObjectId", "criteria": "eq" }
  ];
  var accountheads = await Accounthead.getbyfilter(params);
  if (accountheads && accountheads.length == 1)
  return accountheads[0];
}

async function insert(req) {
  var body = req.body;
  var accounthead = {
    headname: body.headname,
    accounttype: body.accounttype,
    reporthead: body.reporthead,
    cashflowhead: body.cashflowhead,
    headaccount: body.headaccount,
    secure: body.secure,
    property: body.property,
    attachments: body.attachments
  }
  await Joi.validate(accounthead, accountheadSchema, { abortEarly: false });
  return await new Accounthead(accounthead).save(req);
}

async function update(Id, req) {

  var body = req.body;
  var accounthead = await Accounthead.findById(Id);
  accounthead._original = accounthead.toObject();
  accounthead.headname = body.headname,
  accounthead.accounttype = body.accounttype,
  accounthead.reporthead = body.reporthead,
  accounthead.cashflowhead = body.cashflowhead,
  accounthead.headaccount = body.headaccount,
  accounthead.secure = body.secure,
  accounthead.attachments = body.attachments
  accounthead.property = body.property
  return await accounthead.save(req);

}

async function remove(Id, req) {
  var accounthead = await Accounthead.findById(Id);
  accounthead.status = "deleted"
  return await accounthead.save(req);
}

async function filter(params) {
  return await Accounthead.getbyfilter(params)
}

async function findcount(req) {
  return await Accounthead.findcount(req)
}

async function exportdata(params) {
  return await Accounthead.exportdata(params)
}
