const Joi = require('joi');
const Journalledger = require('../models/journalledger.model');

const journalledgerSchema = Joi.object({
  journalnumber: Joi.number().required(),
  prefix: Joi.string().required(),
  journalid: Joi.string().hex().required(),
  date: Joi.date().required(),
  remark: Joi.string(),
  amount: Joi.number().required(),
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
  updateOpeningbalance,
  createOpeningbalance
}

async function updateOpeningbalance(journal, req, res, next) {

  var journalledgers  = req.body.journalledgers;
  var journalid  = journal._id;

  async.waterfall([
    next => {

  Journalledger.find({ journalid: journalid })
               .then((ledgers)=>{

                    async.forEachSeries(ledgers, (ledger, next1) => {
                        Journalledger.findByIdAndRemove(ledger._id)
                                     .then(() => next1())
                    },
                    function(){
                      next(null, ledgers);
                    })

               })

              },
              (obj, next) =>{

                async.forEachSeries(journalledgers, (journalledgerobj, next1) => {

                  const journalledger = new Journalledger({
                    journalid: journalid,
                    amount: journalledgerobj.amount,
                    draccount: journalledgerobj.draccount,
                    craccount: journalledgerobj.craccount,
                    branchid: req.body.branchid ? req.body.branchid: req.body.authkey.branchid._id
                  });

                  journalledger.save(req)
                    .then(() => next1())
                    .catch(e => next(e));

                }, function(){

              res.json(journalledgers);

            }) } ]);

}

async function createOpeningbalance(journal, req, res, next) {

  var journalledgers  = req.body.journalledgers;
  var journalid  = journal._id;

  async.forEachSeries(journalledgers, (journalledgerobj, next1) => {

        const journalledger = new Journalledger({
          journalid: journalid,
          amount: journalledgerobj.amount,
          draccount: journalledgerobj.draccount,
          craccount: journalledgerobj.craccount,
          branchid: req.body.branchid ? req.body.branchid: req.body.authkey.branchid._id
        });

        journalledger.save(req)
          .then(() => next1())
          .catch(e => next(e));

      }, function(){

    res.json(journal);

  })

}

async function findbyId(Id) {
  var params = {}
  params.formname = "journalledger";
  params.search = [
    { "searchfield": "_id", "searchvalue": Id, "datatype": "ObjectId", "criteria": "eq" }
  ];
  var journalledgers = await Journalledger.getbyfilter(params);
  if (journalledgers && journalledgers.length == 1)
  return journalledgers[0];
}

async function insert(req) {
  var body = req.body;
  var journalledger = {
    journalnumber: body.journalnumber,
    prefix: body.prefix,
    journalid: body.journalid,
    date: body.date,
    remark: body.remark,
    amount: body.amount,
    property: body.property,
    attachments: body.attachments
  }
  await Joi.validate(journalledger, journalledgerSchema, { abortEarly: false });
  return await new Journalledger(journalledger).save(req);
}

async function update(Id, req) {

  var body = req.body;
  var journalledger = await Journalledger.findById(Id);
  journalledger._original = journalledger.toObject();
  journalledger.journalid = body.journalid,
  journalledger.date = body.date,
  journalledger.remark = body.remark,
  journalledger.amount = body.amount,
  journalledger.attachments = body.attachments
  journalledger.property = body.property
  return await journalledger.save(req);

}

async function remove(Id, req) {
  var journalledger = await Journalledger.findById(Id);
  journalledger.status = "deleted"
  return await journalledger.save(req);
}

async function filter(params) {
  return await Journalledger.getbyfilter(params)
}

async function getnextdocnumber(req, res, next) {

  var branch = req.body.authkey.branchid;
  var prefix = "";

  if (DATABASETYPE == "branchwise") {
    var docformat = branch.docformat;
    prefix = docformat.journalledger ? docformat.journalledger["prefix"] : "JL";
  } else {
    var docformat = BILLFORMAT;
    if (docformat)
      prefix = docformat.journalledger ? docformat.journalledger["prefix"] : "JL";
  }

  Journalledger.getnextdocnumber(prefix, branch._id)
    .then((journalnumber) => {
      req.body.journalnumber = journalnumber;
      req.body.prefix = prefix;
      if (!req.body.journalid) return res.json(prefix + "-" + journalnumber);
      else next();
    })

}

async function findcount(req) {
  return await Journalledger.findcount(req)
}

async function exportdata(params) {
  return await Journalledger.exportdata(params)
}
