// const bcrypt = require('bcrypt');
const Joi = require('joi');
const Salarycomponent = require('../models/salarycomponent.model');

const salarycomponentSchema = Joi.object({
  payHeadName: Joi.string().required(),
  displayName: Joi.string().required(),

  payHeadTypeID: Joi.number().required(),
  statutoryPayTypeID: Joi.number(),
  incomeTypeID: Joi.number(),
  calculationTypeID: Joi.number().required(),
  attendanceTypeID: Joi.number(),
  productionUnitID: Joi.number(),

  computeformula: Joi.string(),
  calculationPeriodID: Joi.number(),
  perDayCalculationBasisID: Joi.number(),
  userdefinedDays: Joi.number(),

  computationMethodID: Joi.number(),
  computeformula: Joi.string(),
  roundingMethodID: Joi.number(),
  roundingLimit: Joi.number(),

  paySlabs: Joi.array(),
  statutoryNumber: Joi.string(),

  affectNetSalaryOn: Joi.boolean(),
  canMakePartOfEmployeeSalaryStructureOn: Joi.boolean(),
  canrecurringSubequentPayrollsOn: Joi.boolean(),
  taxableComponentOn: Joi.boolean(),
  considerforEPFContributionOn: Joi.boolean(),
  considerforESIContributionOn: Joi.boolean(),
  considerforGratuityOn: Joi.boolean(),
  canShowInPayslipOn: Joi.boolean(),

  isPrimary: Joi.boolean(),
  property: Joi.object()
})


module.exports = {
  insert,
  update,
  remove,
  deletemultiple,
  filter,
  findcount,
  findbyId,
  exportdata
}

async function findbyId(Id) {
  return await Salarycomponent.findById(Id);
}

async function insert(req) {
  var salarycomponent = {
    payHeadName: req.body.payHeadName,
    displayName: req.body.displayName,
    payHeadTypeID: req.body.payHeadTypeID,
    statutoryPayTypeID: req.body.statutoryPayTypeID,
    incomeTypeID: req.body.incomeTypeID,
    calculationTypeID: req.body.calculationTypeID,
    attendanceTypeID: req.body.attendanceTypeID,
    productionUnitID: req.body.productionUnitID,
    computeformula: req.body.computeformula,
    calculationPeriodID: req.body.calculationPeriodID,
    perDayCalculationBasisID: req.body.perDayCalculationBasisID,
    userdefinedDays: req.body.userdefinedDays,
    computationMethodID: req.body.computationMethodID,
    computeformula: req.body.computeformula,
    roundingMethodID: req.body.roundingMethodID,
    roundingLimit: req.body.roundingLimit,
    paySlabs: req.body.paySlabs,
    statutoryNumber: req.body.statutoryNumber,
    affectNetSalaryOn: req.body.affectNetSalaryOn,
    canMakePartOfEmployeeSalaryStructureOn: req.body.canMakePartOfEmployeeSalaryStructureOn,
    canrecurringSubequentPayrollsOn: req.body.canrecurringSubequentPayrollsOn,
    taxableComponentOn: req.body.taxableComponentOn,
    considerforEPFContributionOn: req.body.considerforEPFContributionOn,
    considerforESIContributionOn: req.body.considerforESIContributionOn,
    considerforGratuityOn: req.body.considerforGratuityOn,
    canShowInPayslipOn: req.body.canShowInPayslipOn,
    isPrimary: req.body.isPrimary,
    property: req.body.property
  }

  salarycomponent = await Joi.validate(salarycomponent, salarycomponentSchema, { abortEarly: false });

  salarycomponent = await new Salarycomponent(salarycomponent).save(req);

  var subComponents = req.body.subComponents;
  subComponents.forEach(subComponent => {
    new Salarycomponent(subComponent).save(req);
  });

  return salarycomponent;
}

async function update(Id, req) {
  var salarycomponent = await Salarycomponent.findById(Id);
  salarycomponent._original = salarycomponent.toObject();
  salarycomponent.payHeadName = req.body.payHeadName;
  salarycomponent.displayName = req.body.displayName;
  salarycomponent.payHeadTypeID = req.body.payHeadTypeID;
  salarycomponent.statutoryPayTypeID = req.body.statutoryPayTypeID;
  salarycomponent.incomeTypeID = req.body.incomeTypeID;
  salarycomponent.calculationTypeID = req.body.calculationTypeID;
  salarycomponent.attendanceTypeID = req.body.attendanceTypeID;
  salarycomponent.productionUnitID = req.body.productionUnitID;
  salarycomponent.computeformula = req.body.computeformula;
  salarycomponent.calculationPeriodID = req.body.calculationPeriodID;
  salarycomponent.perDayCalculationBasisID = req.body.perDayCalculationBasisID;
  salarycomponent.userdefinedDays = req.body.userdefinedDays;
  salarycomponent.computationMethodID = req.body.computationMethodID;
  salarycomponent.computeformula = req.body.computeformula;
  salarycomponent.roundingMethodID = req.body.roundingMethodID;
  salarycomponent.roundingLimit = req.body.roundingLimit;
  salarycomponent.paySlabs = req.body.paySlabs;
  salarycomponent.statutoryNumber = req.body.statutoryNumber;
  salarycomponent.affectNetSalaryOn = req.body.affectNetSalaryOn;
  salarycomponent.canMakePartOfEmployeeSalaryStructureOn = req.body.canMakePartOfEmployeeSalaryStructureOn;
  salarycomponent.canrecurringSubequentPayrollsOn = req.body.canrecurringSubequentPayrollsOn;
  salarycomponent.taxableComponentOn = req.body.taxableComponentOn;
  salarycomponent.considerforEPFContributionOn = req.body.considerforEPFContributionOn;
  salarycomponent.considerforESIContributionOn = req.body.considerforESIContributionOn;
  salarycomponent.considerforGratuityOn = req.body.considerforGratuityOn;
  salarycomponent.canShowInPayslipOn = req.body.canShowInPayslipOn;
  salarycomponent.isPrimary = req.body.isPrimary;
  salarycomponent.property = req.body.property;

  return await salarycomponent.save(req);
}

async function remove(Id, req) {
  var salarycomponent = await Salarycomponent.findById(Id);
  salarycomponent.status = "deleted"
  return await salarycomponent.save(req);
}

async function remove(Id, req) {
  var salarycomponent = await Salarycomponent.findById(Id);
  salarycomponent.status = "deleted"
  return await salarycomponent.save(req);
}



async function deletemultiple(Id, req) {
  var salarycomponents = req.body.salarycomponents;
  salarycomponents.forEach(async (salarycmpnt) => {
    var salarycomponent = await Salarycomponent.findById(salarycmpnt._id);
    salarycomponent.status = "deleted"
    Salarycomponent(salarycomponent).save(req)
    .then((salarycomponent) =>{
      salarycomponent.save(req);
    })
  })
  return await salarycomponents;
} 

async function filter(params) {
  return await Salarycomponent.getbyfilter(params)
}

async function findcount(req) {
  return await Salarycomponent.findcount(req)
}

async function exportdata(params) {
  return await Salarycomponent.exportdata(params)
}
