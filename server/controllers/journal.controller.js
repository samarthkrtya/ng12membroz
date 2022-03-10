const Joi = require('joi');
const Journal = require('../models/journal.model');
const journalSchema = Joi.object({
  refid: Joi.string().hex().required(),
  date: Joi.date().required(),
  remark: Joi.string(),
  journaltype: Joi.number().required(),
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
  getnextdocnumber,
  getOpeningbalance
}

async function getOpeningbalance(req, res, next) {

  Journal.findOne({ journaltype: "Opening Balance" })
         .then((journal) => {

            var data = {}
            var journalledgers = {

            }

            if (journal){

              journalledgers.journalid = journal._id;
              data["journalid"] = journal._id;
              data["date"] = journal.date;
              data["journaltype"] = journal.journaltype;

              Journalledger.find({ journalid: journal._id })
                           .then((journalledgers) =>{

                              journalledgers.journalledgers = journalledgers;
                              data["journalledgers"] = journalledgers;
                              res.json(data);

                           })
            }
            else {
              res.json(data)
            }

         })

}

async function findbyId(Id) {
  var params = {}
  params.formname = "journal";
  params.search = [
    { "searchfield": "_id", "searchvalue": Id, "datatype": "ObjectId", "criteria": "eq" }
  ];
  var journals = await Journal.getbyfilter(params);
  if (journals && journals.length == 1)
  return journals[0];
}

async function insert(req) {
  var body = req.body;
  var journal = {
    refid: body.refid,
    date: body.date,
    remark: body.remark,
    journaltype: body.journaltype,
    property: body.property,
    attachments: body.attachments
  }
  await Joi.validate(journal, journalSchema, { abortEarly: false });
  return await new Journal(journal).save(req);
}

async function update(Id, req) {

  var body = req.body;
  var journal = await Journal.findById(Id);
  journal._original = journal.toObject();
  journal.refid = body.refid,
  journal.date = body.date,
  journal.remark = body.remark,
  journal.journaltype = body.journaltype,
  journal.attachments = body.attachments
  journal.property = body.property
  return await journal.save(req);

}

async function remove(Id, req) {
  var journal = await Journal.findById(Id);
  journal.status = "deleted"
  return await journal.save(req);
}

async function filter(params) {
  return await Journal.getbyfilter(params)
}

async function getnextdocnumber(req, res, next) {

  var branch = req.body.authkey.branchid;
  var prefix = "";

  if (DATABASETYPE == "branchwise") {
    var docformat = branch.docformat;
    prefix = docformat.journal ? docformat.journal["prefix"] : "JL";
  } else {
    var docformat = BILLFORMAT;
    if (docformat)
      prefix = docformat.journal ? docformat.journal["prefix"] : "JL";
  }

  Journal.getnextdocnumber(prefix, branch._id)
    .then((journalnumber) => {
      req.body.journalnumber = journalnumber;
      req.body.prefix = prefix;
      if (!req.body.refid) return res.json(prefix + "-" + journalnumber);
      else next();
    })

}

async function findcount(req) {
  return await Journal.findcount(req)
}

async function exportdata(params) {
  return await Journal.exportdata(params)
}
