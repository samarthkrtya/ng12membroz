const Joi = require('joi');
const Paymentschedule = require('../models/paymentschedule.model');
const Paymentscheduleview = require('../views/paymentschedule.view');
import roundTo from 'round-to';
import async from "async";
const moment = require('moment');

const paymentscheduleSchema = Joi.object({
  memberid: Joi.string().hex().required()
})


module.exports = {
  insert,
  update,
  remove,
  filter,
  filterview,
  findcount,
  findbyId,
  findbyIds,
  createpaymentschedule,
  checkpaidterms,
  cleanschedule,
  getnextdocnumber,
  exportdata,
  updateschedules
}

async function updateschedules(Id, req) {

  var paymentschedule = await Paymentschedule.findById(Id);
  var duedates = req.body.duedates;
  if (duedates && duedates.length > 0)
  {
    var noofschedules = req.body.noofschedules;
    var discount = paymentschedule.adjustment / noofschedules
    var taxamount = paymentschedule.taxamount / noofschedules
    var amount = paymentschedule.amount / noofschedules
    var totalamount = paymentschedule.totalamount / noofschedules
    var balance = paymentschedule.balance/ noofschedules
    var invoicenumber = req.body.invoicenumber;

    var taxdetail = paymentschedule.taxdetail;
    for (const tax in taxdetail) {
      var taxamount = (taxdetail[tax]/noofschedules).toFixed(2)
      taxdetail[tax] = taxamount;
    }
    paymentschedule._original = paymentschedule.toObject();

    paymentschedule.adjustment = discount
    paymentschedule.amount = amount
    paymentschedule.totalamount = totalamount
    paymentschedule.balance = balance
    paymentschedule.taxdetail = taxdetail
    paymentschedule.taxamount = taxamount
    paymentschedule.scheduledate = duedates[0];
    await paymentschedule.save(req);

    duedates.shift();
    async.forEachSeries(duedates, (duedate, next) => {

      var scheduledate = duedate;
      const paymentschedule = new Paymentschedule({
        memberid: req.body.memberid,
        onModel: req.body.onModel,
        paymentterms: req.body.paymentterms,
        adjustment: discount,
        balance: balance,
        taxamount: taxamount,
        taxdetail: taxdetail,
        totalamount: totalamount,
        prefix: req.body.invoiceprefix,
        invoicenumber: invoicenumber,
        amount: amount,
        scheduledate: scheduledate,
        branchid: req.body.branchid ? req.body.branchid : req.body.authkey.branchid._id,
        draccount: "5d8c4ce293b7a1063043b9d6",
        craccount: "5d5d4cfe93b7a12dfcfea7b5"
      });

      invoicenumber +=1;
      paymentschedule.save(req)
        .then((sch) => {
          next()
        }
        )
        .catch(e => console.log(e));

    });
    return paymentschedule
  }
  else {

    paymentschedule._original = paymentschedule.toObject();
    var negativeadjustment= req.body.negativeadjustment;
    var adjustment= req.body.adjustment;

    if (adjustment && adjustment > 0) paymentschedule.balance += adjustment
    if (adjustment && adjustment > 0) paymentschedule.amount += adjustment
    if (adjustment && adjustment > 0) paymentschedule.totalamount += adjustment

    if (negativeadjustment && negativeadjustment > 0) paymentschedule.balance -= negativeadjustment
    if (negativeadjustment && negativeadjustment > 0) paymentschedule.amount -= negativeadjustment
    if (negativeadjustment && negativeadjustment > 0) paymentschedule.totalamount -= negativeadjustment

    if (req.body.scheduledate) paymentschedule.scheduledate = req.body.scheduledate;
    return await paymentschedule.save(req);
  }

}

async function getnextdocnumber(req, res, next) {

  console.log("getnextdocnumber called");

  var branch = req.body.authkey.branchid;
  var prefix = "";

  if (DATABASETYPE == "branchwise") {
    var docformat = branch.docformat;
    prefix = docformat.invoice ? docformat.invoice["prefix"] : "INV";
  } else {
    var docformat = BILLFORMAT;
    if (docformat)
      prefix = docformat.invoice ? docformat.invoice["prefix"] : "INV";
  }

  Paymentschedule.getnextdocnumber(prefix, branch._id)
    .then((invoicenumber) => {
      req.body.invoicenumber = invoicenumber;
      req.body.invoiceprefix = prefix;

      if (!req.body.memberid) return res.json(prefix + "-" + invoicenumber);
      else next();
    })

}

async function cleanschedule(req, res, next) {

  var paymentterms = data.property["allterms"];
  var ids = []
  paymentterms.forEach(function (terms) {
    ids.push(terms._id)
  });

  return Paymentschedule.find({ memberid: req.body._id, paymentterms: { $nin: ids } }, { _id: 1 })
    .then((scheules) => {

      async.forEachSeries(scheules, (scheule, next) => {
        Paymentschedule.findByIdAndRemove(scheule._id)
          .then((t) => next())

      }, function () {
        next(data);
      })

    });


}

async function checkpaidterms(req, res, next) {

  var member = req.body.member;
  var paymentterms = member.paymentterms;
  var _id = member._id;
  var newterms = [];
  var allterms = paymentterms;

  if (term) {
    data.property["newterms"] = term.paymentterms;
    allterms = allterms.concat(term.paymentterms);
    data.property["allterms"] = allterms;
    next(data);
  }
  else
    async.forEachSeries(allterms, (element, next) => {

      Paymentschedule.aggregate([
        { "$match": { memberid: _id, paymentterms: element._id } },
        {
          "$group":
          {
            _id: 0,
            paidamount: { "$sum": "$paidamount" }
          }
        }
      ])
        .then((schedule) => {

          if ((schedule[0] && schedule[0].paidamount <= 0) || schedule.length == 0) {
            newterms.push(element);
            Paymentschedule.deleteMany({ memberid: _id, paymentterms: element._id }).then()
          }

          next();
        })
    },
      function () {
        next();
      });
}

async function createpaymentschedule(req, res, next) {

  console.log("createpaymentschedule called");;

  var memberid = req.body.memberid;
  var branch = req.body.authkey.branchid;
  var invoicenumber = req.body.invoicenumber;
  var onModel = req.body.onModel;
  var membershipstart = new Date(req.body.membershipstart);
  var paymentterms = req.body.paymentterms;

  var now = moment();
  var localOffset = now.tz(branch.timezone).utcOffset();

  async.forEachSeries(paymentterms, (element, next) => {
    var scheduledate = new Date(membershipstart);
    var month = scheduledate.getMonth();
    var year = scheduledate.getFullYear();
    var startperiod = 0;
    var taxamount = 0, taxrate = 0;
    if (element.startperiod) startperiod = element.startperiod;
    var limit = element.tenure ? element.tenure : 1;
    if (element.period == "Once") {
      month += startperiod;
      if (month >= 12) {
        month -= 12;
        year += 1;
      }
      scheduledate.setMonth(month);
      scheduledate.setYear(year);
    }
    else if (element.period == "Monthly") {
      month += startperiod;
      if (month >= 12) {
        month = 0;
        year += 1;
      }
    }
    else if (element.period == "Quarterly") {
      month += startperiod * 3;
      if (month >= 12) {
        month = month - 12;
        year += 1;
      }
    }
    else if (element.period == "HalfYearly") {
      month += startperiod * 6;
      if (month >= 12) {
        month = month - 12;
        year += 1;
      }
    }
    else if (element.period == "Yearly") {
      year += startperiod;
      if (month >= 12) {
        month = month - 12;
        year += 1;
      }
    }

    async.times(limit, function (n, next) {
      if (element.period === "Monthly") {
        if (month >= 12) {
          month = 0;
          year += 1;
        }

        scheduledate.setMonth(month);
        scheduledate.setFullYear(year);
        month += 1        
        if (element.date && n > 0) {
          scheduledate.setUTCHours(0, 0, 0, 0);
          //scheduledate.setUTCDate(scheduledate.getUTCDate() + 1);
          scheduledate.setUTCDate(element.date);
          scheduledate.setUTCMinutes(scheduledate.getUTCMinutes() - localOffset);
        }
        console.log("scheduledate", scheduledate)
      }
      else if (element.period === "Quarterly") {

        if (month >= 12) {
          month = month - 12;
          year += 1;
        }
        scheduledate.setMonth(month);
        scheduledate.setFullYear(year);

        month += 3
        if (element.date && n > 0) {
          scheduledate.setUTCHours(0, 0, 0, 0);
          scheduledate.setUTCDate(element.date);
          scheduledate.setUTCMinutes(scheduledate.getUTCMinutes() - localOffset);
          //scheduledate.setDate(element.date);
        }

      }
      else if (element.period === "HalfYearly") {

        if (month >= 12) {
          month = month - 12;
          year += 1;
        }

        scheduledate.setMonth(month);
        scheduledate.setFullYear(year);
        month += 6
        if (element.date && n > 0) {
          scheduledate.setUTCHours(0, 0, 0, 0);
          scheduledate.setUTCDate(element.date);
          scheduledate.setUTCMinutes(scheduledate.getUTCMinutes() - localOffset);
         // scheduledate.setDate(element.date);
        }

      }
      else if (element.period === "Yearly") {

        if (month >= 12) {
          month = month - 12;
          year += 1;
        }


        if (element.date && n > 0) {
          scheduledate.setUTCHours(0, 0, 0, 0);
          scheduledate.setUTCDate(element.date);
          scheduledate.setUTCMinutes(scheduledate.getUTCMinutes() - localOffset);
         // scheduledate.setDate(element.date);
        } 

        scheduledate.setMonth(month);
        scheduledate.setYear(year);
        year += 1;
      }

      var clonescheduledate = new Date(scheduledate);
      var discount = 0;
      if (element.discount) discount = element.discount;

      var taxes = element.taxes;
      var taxdetail = {}
      taxrate = 0;

      if (taxes)
      taxes.forEach(function (tax) {
        taxrate += tax.amount;
        taxdetail[tax.taxname] = (tax.amount * (element.amount - discount) / 100).toFixed(2);
      }, this);

      if (taxrate > 0)
        taxamount = (element.amount - discount) * (taxrate / 100);

      var totalamount = element.amount - discount + taxamount;

      const paymentschedule = new Paymentschedule({
        memberid: memberid,
        onModel: onModel,
        paymentterms: element._id,
        adjustment: discount,
        balance: totalamount,
        taxamount: taxamount,
        taxdetail: taxdetail,
        totalamount: totalamount,
        prefix: req.body.invoiceprefix,
        invoicenumber: invoicenumber,
        amount: element.amount,
        scheduledate: clonescheduledate,
        branchid: req.body.branchid ? req.body.branchid : req.body.authkey.branchid._id,
        draccount: "5d8c4ce293b7a1063043b9d6",
        craccount: "5d5d4cfe93b7a12dfcfea7b5"
      });
      invoicenumber +=1;
      paymentschedule.save(req)
        .then((sch) => {
          next()
        }
        )
        .catch(e => next(e));

    },
      function () {
        //console.log("2")
        next();
      });

  },
    function () {
      res.json(req.body);
    }

  );
}

async function findbyId(Id) {
  return await Paymentschedule.findById(Id);
}

async function findbyIds(Ids) {
  return await Paymentschedule.find({ _id: { "$in": Ids } }).sort({ scheduledate: 1 });
}

async function insert(req) {
  var paymentschedule = req.body.paymentschedule;
  paymentschedule = await Joi.validate(paymentschedule, paymentscheduleSchema, { abortEarly: false });
  return await new Paymentschedule(paymentschedule).save(req);
}

async function update(Id, req) {
  var paymentschedule = await Paymentschedule.findById(Id);
  paymentschedule._original = paymentschedule.toObject();
  return await paymentschedule.save(req);
}

async function remove(Id, req) {
  var paymentschedule = await Paymentschedule.findById(Id);
  paymentschedule.status = "deleted"
  return await paymentschedule.save(req);
}

async function filterview(params) {
  return await Paymentscheduleview.getfilterview(params)
}

async function filter(params) {
  return await Paymentschedule.getbyfilter(params)
}

async function findcount(req) {
  return await Paymentschedule.findcount(req)
}

async function exportdata(params) {

  return await Paymentschedule.exportdata(params)
}
