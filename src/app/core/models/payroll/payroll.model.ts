export class PayrollModel {
    _id: string;
    month: number;
    year: number;
    paymentdate: Date;
    workingdays: number;
    weeklyoffdays: number;
    holidays: number;
    payrollcost: number;
    payrollnetpay: number;
    taxes: number;
    pretaxdeductions: number;
    posttaxdeductions: number;
    employeesalary: any[] = [];
    branchid: string;
}