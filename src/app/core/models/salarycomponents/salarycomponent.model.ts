export class SalaryComponentModel {

  _id: string;
  payHeadName: String;
  displayName: String;
  payHeadTypeID: Number;
  statutoryPayTypeID: Number;
  incomeTypeID: Number;
  calculationTypeID: Number;
  attendanceTypeID: Number;
  productionUnitID: Number;
  calculationPeriodID: Number;
  perDayCalculationBasisID: Number;
  userdefinedDays: Number;
  computationMethodID: Number;

  computeformula: String;
  canMakePartOfEmployeeSalaryStructureOn: Boolean;
  roundingMethodID: Number;
  roundingLimit: Number;

  paySlabs: PaySlab[];
  subComponents: SalaryComponentModel[] = [];

  statutoryNumber: string;

  // other configuration
  affectNetSalaryOn: Boolean;
  canrecurringSubequentPayrollsOn: Boolean;
  taxableComponentOn: Boolean;
  considerforEPFContributionOn: Boolean;
  considerforESIContributionOn: Boolean;
  considerforGratuityOn: Boolean;
  canShowInPayslipOn: Boolean;

  isPrimary: Boolean;
  property: Object;
  status: string;
}

export class PaySlab {
  id: string;
  amountGreaterThan: number;
  amountUpTo: number;
  valueTypeID: number;
  value: number;
}

export class SalaryComponentLookups {
  payHeadTypes: any[] = [
    { id: 101, name: "Earnings for Employees" },
    { id: 102, name: "Deductions from Employees" },
    // { id: 103, name: "Employees's Statutory Deductions" },
    // { id: 104, name: "Employer's Statutory Contributions" },
    { id: 105, name: "Employer's Other Charges" },
    // { id: 106, name: "Bonus" },
    // { id: 107, name: "Gratuity" },
    // { id: 108, name: "Loan and Advance" },
    { id: 109, name: "Reimbursements to Employees" }
  ];

  employeeStatutoryDeductions: any[] = [
    { id: 201, name: "Income Tax" },
    { id: 202, name: "Professional Tax" },
    { id: 203, name: "PF Account (A/c No. 1)" },
    { id: 204, name: "Voluntary PF (A/c No. 1)" },
    { id: 205, name: "Employee State Insurance" },
    { id: 206, name: "Labour Welfare Fund" },
    { id: 207, name: "National Pension Scheme (Tier-I)" },
    { id: 208, name: "National Pension Scheme (Tier-II)" }
  ];

  employerStatutoryContributions: any[] = [
    { id: 301, name: "PF Account (A/c No. 1)" },
    { id: 302, name: "EPS Account (A/c No. 10)" },
    { id: 303, name: "Employee State Insurance" },
    { id: 304, name: "Labour Welfare Fund" },
    { id: 305, name: "National Pension Scheme (Tier-I)" },
    { id: 306, name: "National Pension Scheme (Tier-II)" }
  ];

  emplyerOtherCharges: any[] = [
    { id: 401, name: "EPF Admin Charges (A/c No. 2)" },
    { id: 402, name: "EDLI Contribution (A/c No. 21)" },
    { id: 403, name: "EDLI Admin Charges (A/c No. 22)" }
  ];

  calculationTypes: any[] = [
    // { id: 501, name: "As Computed Value" },
    // { id: 502, name: "As User defined Value" },
    { id: 503, name: "Flat Rate" },
    { id: 504, name: "On Attendance" },
    // { id: 505, name: "On Production" },
  ];

  attendanceTypes: any[] = [
    { id: 601, name: "Attendance / leave with pay" },
    { id: 602, name: "Leave without pay" },
  ]

  calculationPeriods: any[] = [
    { id: 701, name: "Days" },
    { id: 702, name: "Months" },
    { id: 703, name: "Nights" },
    { id: 704, name: "Weeks" },
    { id: 705, name: "Year" },
  ]

  perDayCalculationBasises: any[] = [
    { id: 801, name: "As per Calendar Period" },
    { id: 802, name: "User Defined" },
    { id: 803, name: "User Defined Calendar Type" },
  ]

  computationMethods: any[] = [
    { id: 901, name: "On Current Earnings Total" },
    { id: 902, name: "On Current Deductions Total" },
    { id: 903, name: "On Current Sub Total" },
    { id: 904, name: "On Specified Formula" }
  ]

  valueTypes: any[] = [
    { id: 1001, name: "Value" },
    { id: 1002, name: "Percentage" }
  ]
}