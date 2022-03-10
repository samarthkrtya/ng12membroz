const mongoose = require('mongoose');
const mongooseHistory = require('../lib/mongoose-history');
const common = require('../helpers/common');

const SalarycomponentSchema = new mongoose.Schema({
  payHeadName: {
    type: String,
    required: true
  },
  displayName: {
    type: String,
    required: true
  },

  payHeadTypeID: {
    type: Number,
    required: true
  },
  statutoryPayTypeID: Number,
  incomeTypeID: Number,

  calculationTypeID: {
    type: Number,
    required: true
  },
  attendanceTypeID: Number,
  productionUnitID: Number,
  calculationPeriodID: Number,
  perDayCalculationBasisID: Number,
  userdefinedDays: Number,
  computationMethodID: Number,

  computeformula: String,
  roundingMethodID: Number,
  roundingLimit: Number,

  paySlabs: [],
  statutoryNumber: String,

  // other configuration
  affectNetSalaryOn: Boolean,
  canMakePartOfEmployeeSalaryStructureOn: Boolean,
  canrecurringSubequentPayrollsOn: Boolean,
  taxableComponentOn: Boolean,
  considerforEPFContributionOn: Boolean,
  considerforESIContributionOn: Boolean,
  considerforGratuityOn: Boolean,
  canShowInPayslipOn: Boolean,

  isPrimary: Boolean,
  property: Object,

  branchid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch'
  },
  addedby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: { type: String, default: "active" }
},
  {
    versionKey: false
  });

var options = { customCollectionName: "histories", diffOnly: true, metadata: [{ key: 'schemaname', value: 'salarycomponents' }] }

SalarycomponentSchema.plugin(mongooseHistory, options)

SalarycomponentSchema.statics = {

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
      .then((salarycomponents) => {
        return salarycomponents;
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
      .then((salarycomponents) => {
        return salarycomponents;
      })

  }


}

module.exports = mongoose.model('Salarycomponent', SalarycomponentSchema);
