const mongoose = require('mongoose');
const mongooseHistory = require('../lib/mongoose-history');
const mongooseautopopulate = require('mongoose-autopopulate');
const common = require('../helpers/common');

const PayrollSchema = new mongoose.Schema({
  month: Number,
  year: Number,
  paymentdate: Date,
  workingdays: Number,
  weeklyoffdays: Number,
  holidays: Number,
  payrollcost: Number,
  payrollnetpay: Number,
  taxes: Number,
  pretaxdeductions: Number,
  posttaxdeductions: Number,
  employeesalary: [{
    employeeid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      autopopulate: { maxDepth: 1 }
    },
    advance: Number,
    bonus: Number,
    deduction: Number,

    workingdays: Number,
    weeklyoffdays: Number,
    holidays: Number,
    presentdays: Number,
    paidleave: Number,
    absentdays: Number,
    paiddays: Number,
    cf: Number,

    actualsalary: Number,

    taxableIncome: Number,
    taxonincome: Number,
    taxamount: Number,
    commission: Number,
    earnings: Number,
    statutorydeductions: Number,
    netonhand: Number,

    salarycomponents: [],
    earnedSalarycomponents: []

  }],
  property: Object,
  branchid: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  addedby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: { type: String, default: "active" }
},
  {
    versionKey: false,
    timestamps: true
  });

PayrollSchema.plugin(mongooseautopopulate);

PayrollSchema.options.selectPopulatedPaths = false;

var options = { customCollectionName: "histories", diffOnly: true, metadata: [{ key: 'schemaname', value: 'payrolls' }] }

PayrollSchema.plugin(mongooseHistory, options)

PayrollSchema.statics = {

  getemployeepayroll(employeeid) {
    employeeid = mongoose.Types.ObjectId(employeeid);
    return this.aggregate([
      {
        $match: {
          status: "paid",
        },
      },
      {
        $unwind: {
          path: "$employeesalary",
        },
      },
      {
        $match: {
          "employeesalary.employeeid": employeeid,
        },
      },
      {
        $sort: {
          "year": -1,
          "month": -1
        }
      },
      {
        $project: {
          month: 1,
          year: 1,
          employeesalary: "$employeesalary"
        },
      }
    ])
    .then((payroll) => {
        return payroll;
    });
  },

  getbyfilter(params) {

    var query = common.generatequery(params);

    var pageNo = parseInt(params.pageNo);
    var size = parseInt(params.size);
    var limit, skip;

    var sort = params.sort;
    if (!sort) {
      sort = {
        "updatedAt": -1,
        "createdAt": -1
      }
    }

    if (pageNo < 0 || pageNo === 0) {
      return { "error": true, "message": "invalid page number, should start with 1" };
    }

    skip = size * (pageNo - 1)
    limit = size;
    if (params.searchtext && !Array.isArray(params.searchtext)) {
      skip = 0;
      limit = 0;
    }
    return this.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean({ virtuals: true, autopopulate: { maxDepth: 2 } })
      .exec()
      .then((payrolls) => {
        return payrolls;
      })

  },

  findcount(req) {

    var params = req.body;
    var size = parseInt(params.size);
    var query = common.generatequery(params);
    return this.countDocuments(query).exec().then((totalCount) => {
      var totalPages = Math.ceil(totalCount / size)
      req.header = { "error": false, "totalCount": totalCount, "totalPages": totalPages };
    })

  },

  exportdata(params) {

    var query = common.generatequery(params);

    var sort = params.sort;
    if (!sort) {
      sort = {
        "updatedAt": -1,
        "createdAt": -1
      }
    }

    return this.find(query)
      .sort(sort)
      .lean({ virtuals: true, autopopulate: { maxDepth: 2 } })
      .exec()
      .then((payrolls) => {
        return payrolls;
      })

  }


}

module.exports = mongoose.model('Payroll', PayrollSchema);
