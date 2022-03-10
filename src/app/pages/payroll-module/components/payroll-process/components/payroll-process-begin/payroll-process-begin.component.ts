import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { BaseComponemntComponent } from "../../../../../../shared/base-componemnt/base-componemnt.component";
import { PayrollService } from 'src/app/core/services/payroll/payroll.service';
import { UsersService } from 'src/app/core/services/users/users.service';
import { PagerService } from 'src/app/core/services/common/pager.service';
import { salarycomponentService } from 'src/app/core/services/salarycomponents/salarycomponents.service';
import { FormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { date } from 'joi';
import { MatPaginator } from '@angular/material/paginator';
import swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { unique } from 'jquery';

@Component({
  selector: 'app-payroll-process-begin',
  templateUrl: './payroll-process-begin.component.html',
})
export class PayrollProcessBeginComponent extends BaseComponemntComponent implements OnInit {
  isLoadingResults: boolean = true;
  submitted: boolean = false;
  isActive: boolean = true;

  bindid: string;
  payroll: any = {};
  payHeadList: any = [];
  selectedCategory: any;

  selectedMonthName: string = ""
  @ViewChild('paginator') paginator: MatPaginator;
  payrollStatus: string = "Draft"
  paymentdate: Date = new Date()

  displayedColumns: string[] = ['slno', 'employeename', 'actualsalary', 'paiddays', 'presentdays', 'paidleave', 'absentdays', 'cf', 'earnings', 'statutorydeductions', 'advance', 'bonus', 'deduction', 'taxamount', 'commission', 'netonhand'];
  displayedColumns1: string[] = ['slno', 'employeename', 'hourlyrate', 'totalhours', 'earnings', 'advance', 'bonus', 'deduction', 'taxamount', 'commission', 'netonhand'];

  //displayedColumns: string[] = ['slno', 'employeename', 'desgination', 'actualsalary', 'paiddays', 'presentdays', 'paidleave', 'absentdays', 'overtime', 'overtimeamount', 'cf', 'earnings', 'statutorydeductions', 'advance', 'bonus', 'deduction', 'taxamount', 'netonhand'];
  dataSource = new MatTableDataSource();
  
  @ViewChild(MatSort, { static: false }) sort: MatSort = {} as MatSort
  appointmentData: any[] = [];
  commissionValue: any = {};
  advanceData: any[] = [];
  //pagination
  pager: any = {};
  pager1: any = {};
  pagedItems: any[];
  pagedItem1: any[];
  selectedPageSize: number;
  totalPages = 0;
  userData: any[] = [];
  employeesalary: any[] = [];
  categoryData: any[] = [];
  isDisplay: Boolean = false;
  @ViewChild('TABLE') table: ElementRef;
  
  payrollType: String = "Salary Component";
  constructor(public fb: FormBuilder,
    private _route: ActivatedRoute,
    private _payrollService: PayrollService,
    private _salaryComponentService: salarycomponentService,
    private _usersService: UsersService,
    private _pagerService: PagerService) {
    super();
    this.pagename = "payroll-process-begin";
    this._formName = "user";

    this._route.params.forEach((params) => {
      this.bindid = params["id"];
    });
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  async ngOnInit() {
    super.ngOnInit();
    try {
      await this.initializeVaraiable();
      await this.getPayrollType();
      await this.getUserData();
      await this.getAllSalaryComponent();
      this.getStaffCategory();
      await this.getAppointments();
      await this.getCommissionType();
      await this.getAdvanceData();
      await this.getPayrollByid(this.bindid);
        if (this.payroll.status === 'active') {
          await this.getPayrollProcess();
        } else {
          this.isActive = false;
          this.payrollStatus = "Processed";
        }

      this.dataSource = new MatTableDataSource()
      this.dataSource = new MatTableDataSource(this.payroll.employeesalary);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    } catch (error) {
      console.error({ error });
    }

  }

  getMonth(month: any) {
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return months[month - 1];
  }

  async initializeVaraiable() {
    this.payHeadList = [];
    this.paymentdate = new Date()
    this.payroll.month = 1
    this.payroll.year = 2000
    this.payroll.paymentdate = new Date()
    this.payroll.workingdays = 0
    this.payroll.weeklyoffdays = 0
    this.payroll.holidays = 0
    this.payroll.payrollcost = 0
    this.payroll.payrollnetpay = 0

    this.payroll.employeesalary = [];
    return;
  }

  async getPayrollType(){
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" })

    var method = "POST"
    var url = "payrollsettings/filter"
    return this._commonService.commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          this.payrollType = data[0]?.property?.payrolltype ? data[0]?.property?.payrolltype : "Salary Component";
        }
      })
  }


  async getUserData(){
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" })

    return this._usersService
      .AsyncGetByViewfilter(postData)
      .then((data: any) => {
        if (data) {
          this.userData = data;
        }
      })
  }

  async getAllSalaryComponent() {
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" })

    return this._salaryComponentService
      .AsyncGetByfilterLookupName(postData)
      .then(data => {
        if (data) {
          this.payHeadList = data;
        }
      })
  }

  async getStaffCategory(){
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "formid", "searchvalue": "617a77200610e618d440426f", "criteria": "eq" })

    var url = "formdatas/filter"
    var method = "POST"
    return this._commonService.commonServiceByUrlMethodData(url, method, postData)
      .subscribe((data: any) => {
        if (data) {
          this.categoryData = data;
          if(this.categoryData.length > 0)
          {    
            this.isDisplay = true
          }
        }
      })
  }

  async getPayrollByid(id: any) {
    this.isLoadingResults = true;

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });
    postData["search"].push({ "searchfield": "_id", "searchvalue": id, "criteria": "eq" });

    return this._payrollService
      .AsyncGetById(id)
      .then(data => {
        if (data) {
          this.payroll = data;
          this.selectedMonthName = this.getMonth(this.payroll.month);
          this.payroll.employeesalary.sort(function (a, b) {
            var nameA = a.employeeid.fullname.toUpperCase(); // ignore upper and lowercase
            var nameB = b.employeeid.fullname.toUpperCase(); // ignore upper and lowercase
            if (nameA < nameB) {
              return -1;
            }
            if (nameA > nameB) {
              return 1;
            }

            // names must be equal
            return 0;
          });

          this.employeesalary =this.payroll.employeesalary;
          this.dataSource = new MatTableDataSource()
          this.dataSource = new MatTableDataSource(this.payroll.employeesalary);
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
          this.isLoadingResults = false;
        }
      })
  }

  async getPayrollProcess() {
    this.isLoadingResults = true;
    if(this.payrollType == 'Salary Component'){
      let postData = {
        "id": "611a114273e23eacacaa6bf2",
        "search": []
      };
      var month = new Date(this.payroll.year, this.payroll.month - 1, 1, 0, 0, 0)
      var noofdays = month.getDate();
      postData["search"] = [];
      postData["search"].push({ "searchfield": "startdate", "searchvalue": new Date(this.payroll.year, this.payroll.month - 1, 1, 0, 0, 0), "criteria": "eq", "datatype": "date" });
      postData["search"].push({ "searchfield": "enddate", "searchvalue": new Date(this.payroll.year, this.payroll.month, noofdays - 1, 23, 59, 59), "criteria": "eq", "datatype": "date" });
      return this._payrollService
        .Process(postData)
        .subscribe(data => {
          if (data) {
            const attendanceProcessView: any = data
            const employeesalary = attendanceProcessView.map(att => {
              let p = this.payroll.employeesalary.find(x => x.employeeid._id === att._id)
  
              if (p) {
                return { ...att, advance: p.advance, bonus: p.bonus, deduction: p.deduction, taxableIncome: p.taxableIncome, taxonincome: p.taxonincome, taxamount: p.taxamount, commission: p.commission }
              } else {
                return { ...att }
              }
            });
            this.payroll.employeesalary = employeesalary
            this.payroll.employeesalary.forEach(p => {
                p.earnedSalarycomponents = [];
                // p.monthDays = p.workingdays + p.weeklyoffdays + p.holidays
                p.monthDays = this.getDaysInMonth(p.currentmonth, p.currentyear)
  
                // p.paiddays = 27;
                // p.presentdays = 25;
                this.setSalaryComponent(p);
                this.setEarnedSalaryComponent(p);
                // p.calculateEarnedCmpnts = p.salarycomponents;
                p.salarycomponents = this.updateSalaryComponent(p);
                p.actualsalary = this.getPayHeadTypeValue(p.salarycomponents, [101]) ? this.getPayHeadTypeValue(p.salarycomponents, [101]) : 0
                p.earnings = this.getPayHeadTypeValue(p.earnedSalarycomponents, [101])
                this.calculatePayHead( p.salarycomponents);
                p.commission = this.getCommissionValue(p);
                p.advance = this.getAdvance(p);
                p.deduction = this.getDeductionValue(p)
                p.statutorydeductions = this.getPayHeadTypeValue(p.salarycomponents, [103]) ? this.getPayHeadTypeValue(p.salarycomponents, [103]) : 0
                p.netonhand = ((Number(p.earnings) + Number(p.bonus) + Number(p.commission)) - (Number(p.statutorydeductions) + Number(p.advance) + Number(p.deduction) + Number(p.taxamount))).toFixed(0);
            });
  
  
            this.payroll.paymentdate = new Date()
            this.payroll.workingdays = data[0].workingdays
            this.payroll.weeklyoffdays = data[0].weeklyoffdays
            this.payroll.holidays = data[0].holidays
            this.payroll.payrollcost = 0
            this.payroll.payrollnetpay = this.getPayrollNetPay();
  
            this.payroll.employeesalary.sort(function (a, b) {
              var nameA = a.fullname.toUpperCase(); // ignore upper and lowercase
              var nameB = b.fullname.toUpperCase(); // ignore upper and lowercase
              if (nameA < nameB) {
                return -1;
              }
              if (nameA > nameB) {
                return 1;
              }
  
              // names must be equal
              return 0;
            });
            this.employeesalary = this.payroll.employeesalary
            this.dataSource = new MatTableDataSource()
            this.dataSource = new MatTableDataSource(this.payroll.employeesalary);
            this.dataSource.sort = this.sort;
            this.dataSource.paginator = this.paginator;
            this.isLoadingResults = false;
          }
        })
    }else if(this.payrollType == 'Hourly Rate'){
      let postData = {
        "id": "61aee47708ad532993048ee3",
        "search": []
      };
      var month = new Date(this.payroll.year, this.payroll.month - 1, 1, 0, 0, 0)
      var noofdays = month.getDate();
      postData["search"] = [];
      postData["search"].push({ "searchfield": "startdate", "searchvalue": new Date(this.payroll.year, this.payroll.month - 1, 1, 0, 0, 0), "criteria": "eq", "datatype": "date" });
      postData["search"].push({ "searchfield": "enddate", "searchvalue": new Date(this.payroll.year, this.payroll.month, noofdays - 1, 23, 59, 59), "criteria": "eq", "datatype": "date" });
  
      return this._payrollService
        .Process(postData)
        .subscribe(data => {
  
          if (data) {
            const attendanceProcessView: any = data
            const employeesalary = attendanceProcessView.map(att => {
              let p = this.payroll.employeesalary.find(x => x.employeeid._id === att._id)
  
              if (p) {
                return { ...att, advance: p.advance, bonus: p.bonus, deduction: p.deduction, taxableIncome: p.taxableIncome, taxonincome: p.taxonincome, taxamount: p.taxamount, commission: p.commission }
              } else {
                return { ...att }
              }
            });
            this.payroll.employeesalary = employeesalary
            this.payroll.employeesalary.forEach(p => {
                p.earnedSalarycomponents = [];
                // p.monthDays = p.workingdays + p.weeklyoffdays + p.holidays
                p.monthDays = this.getDaysInMonth(p.currentmonth, p.currentyear)
  
                // p.paiddays = 27;
                // p.presentdays = 25;
                // this.setSalaryComponent(p);
  
                // this.setEarnedSalaryComponent(p);
                // p.actualsalary = this.getPayHeadTypeValue(p.salarycomponents, [101])
                p.earnings = p.hourlyPay * p.totalHours
                // p.statutorydeductions = this.getPayHeadTypeValue(p.salarycomponents, [103])
                p.commission = this.getCommissionValue(p);
                p.advance = this.getAdvance(p);
                p.deduction = this.getDeductionValue(p)
                p.netonhand = ((Number(p.earnings) + Number(p.bonus) + Number(p.commission)) - ( Number(p.advance) + Number(p.deduction) + Number(p.taxamount))).toFixed(0);
            });
  
  
            this.payroll.paymentdate = new Date()
            // this.payroll.workingdays = data[0].workingdays
            this.payroll.weeklyoffdays = data[0].weeklyoffdays
            // this.payroll.holidays = data[0].holidays
            this.payroll.payrollcost = 0
            this.payroll.payrollnetpay = this.getPayrollNetPay();
  
            this.payroll.employeesalary.sort(function (a, b) {
              var nameA = a.fullname.toUpperCase(); // ignore upper and lowercase
              var nameB = b.fullname.toUpperCase(); // ignore upper and lowercase
              if (nameA < nameB) {
                return -1;
              }
              if (nameA > nameB) {
                return 1;
              }
  
              // names must be equal
              return 0;
            });

            this.employeesalary = this.payroll.employeesalary
            this.dataSource = new MatTableDataSource()
            this.dataSource = new MatTableDataSource(this.payroll.employeesalary);
            this.dataSource.sort = this.sort;
            this.dataSource.paginator = this.paginator;
            this.isLoadingResults = false;
          }
        })
    }
   
  }

  calculatePayHead(revision: any) {
    if(revision){
      let grossEarning = 0
      let epfEarning = 0
      let esiEarning = 0
      let grossEarningComponents = revision.filter(x => x.payHeadTypeID === 101)
      let epfEarningComponents = revision.filter(x => x.considerforEPFContributionOn === true)
      let esiEarningComponents = revision.filter(x => x.considerforESIContributionOn === true)
  
      if (grossEarningComponents.length > 0) {
        grossEarning = grossEarningComponents.map(item => Number(item.amount)).reduce((prev, next) => prev + next);
      }
      if (epfEarningComponents.length > 0) {
        epfEarning = epfEarningComponents.map(item => Number(item.amount)).reduce((prev, next) => prev + next);
      }
      if (esiEarningComponents.length > 0) {
        esiEarning = esiEarningComponents.map(item => Number(item.amount)).reduce((prev, next) => prev + next);
      }
  
      revision.forEach(element => {
        if (element.calculationTypeID === 501) {
          switch (element.statutoryPayTypeID) {
            case 202: {
              //Professional Tax; 
              element.amount = this.getPayHeadComputatedValue(Number(grossEarning), element.paySlabs).toFixed(0);
              element.amountAnnually = element.amount * 12;
              break;
            }
            case 203: {
              //PF Account (A/c No. 1);
              element.amount = this.getPayHeadComputatedValue(Number(epfEarning), element.paySlabs).toFixed(0);
              element.amountAnnually = element.amount * 12;
              break;
            }
            case 205: {
              //Employee State Insurance; 
              element.amount = this.getPayHeadComputatedValue(Number(esiEarning), element.paySlabs).toFixed(0);
              element.amountAnnually = element.amount * 12;
              break;
            }
            case 301: {
              //Employer's PF Account (A/c No. 1);
              element.amount = this.getEmployerComputatedValue(Number(epfEarning), element.paySlabs).toFixed(0);
              element.amountAnnually = element.amount * 12;
              break;
            }
            case 302: {
              // EMployer PF Account EPS(A/c No. 1);
              element.amount = this.getEmployerComputatedValue(Number(epfEarning), element.paySlabs).toFixed(0);
              element.amountAnnually = element.amount * 12;
  
              break;
            }
            case 303: {
              // EMployer PF Account EPS(A/c No. 1);
              element.amount = this.getESIComputatedValue(Number(esiEarning), element.paySlabs).toFixed(0);
              element.amountAnnually = element.amount * 12;
  
              break;
            }
            default: {
              element.amount = this.getPayHeadComputatedValue(Number(grossEarning), element.paySlabs).toFixed(0);
              element.amountAnnually = element.amount * 12;
              break;
            }
          }
        }
      });
    }
   
  }

  getESIComputatedValue(value: number, paySlabs: any){
    let computedValue = (Number(value)* Number(paySlabs[0].value)) / 100;
    return computedValue;
  }


  getEmployerComputatedValue(value: number, paySlabs: any){
    let totalEmployer = (Number(value)* 12) / 100; //Employer's EPF 12%
    let computedValue;
    if(totalEmployer > 1800){ 
      computedValue = (paySlabs[0].value * 1800 )/12;
    }else{
      computedValue = (paySlabs[0].value * totalEmployer )/12;
    }
    return computedValue;
  }

  getPayHeadComputatedValue(value: number, paySlabs: any) {
    let slab = paySlabs.find(x => value >= x.amountGreaterThan && (x.amountUpTo === null || value < x.amountUpTo))
    let computedValue: number = 0
    if (slab) {
      let valueType: number = 1;
      if (slab.valueTypeID === 1002) {
        valueType = value * 0.01;
      }
      computedValue = Number(slab.value) * valueType;
    }
    return computedValue;
  }

  updateSalaryComponent(p){
    if(p.salarycomponents){
      p.salarycomponents.forEach(element => {
        if(element.payHeadTypeID == 101){
          let value = p.earnedSalarycomponents.find(x => x.salarycomponentid == element.salarycomponentid)?.amount;
          element.amount = value;
        }else{
          let value = p.salarycomponents.find(x => x.salarycomponentid == element.salarycomponentid)?.amount;
          element.amount = value;
        }
      })
    }
    return p.salarycomponents
  }

  getDaysInMonth(month,year) {
   return new Date(year, month, 0).getDate();
  };

  async getAppointments(){
    let date = new Date()
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "confirmed", "criteria": "eq"});
    postData["search"].push({ "searchfield": "appointmentdate", "searchvalue": new Date(date.getUTCFullYear(), 0, 1), "criteria": "gte", "datatype": "Date", "cond": "and" });
    postData["search"].push({ "searchfield": "appointmentdate", "searchvalue": new Date(date.getUTCFullYear(), 11, 31),"criteria": "lte", "datatype": "Date", "cond": "and" });
    let url = 'appointments/filter';
    let method = 'POST';
    this._commonService
      .commonServiceByUrlMethodData(url, method, postData)
      .subscribe((data: any) => {
        this.appointmentData = data
      })
  }

  async getCommissionType(){
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "branchid", "searchvalue": this._loginUserBranchId, "criteria": "eq", "datatype": "ObjectId" });

    let url = 'payrollsettings/filter';
    let method = 'POST';
    this._commonService
      .commonServiceByUrlMethodData(url, method, postData)
      .subscribe((data: any) => {
        this.commissionValue = data[0]
      })
  }

  getCommissionValue(p){
    let commissionArray = [],commissions = [];
    if(this.commissionValue?.service?.employees){
      this.commissionValue?.service?.employees.forEach((c) => {
        if (!commissionArray.includes(c._id)) {
          commissionArray.push(c._id);
        }
      });
      if(commissionArray){
        commissionArray.forEach(ele => {
          commissions.push(this.commissionValue.service.employees.find(x=> x._id == ele))
       })
       p.commission = 0;
       this.appointmentData.forEach(element => {
         if(element?.host?._id == p._id && this.commissionValue){
           commissions.forEach(ele => {
             if(ele.serviceid == element.refid._id && ele.employeeid == p._id){
                 p.commission = p.commission + ele.commission
             }
           });
         }
       })
      }
    
    }
   
    return p.commission;
  }

  getAdvanceData(){
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "branchid", "searchvalue": this._loginUserBranchId, "criteria": "eq", "datatype": "ObjectId" });
    postData["search"].push({ "searchfield": "wfstatus", "searchvalue": "Approved", "criteria": "eq" });

    let url = 'advanceclaims/filter';
    let method = 'POST';
    this._commonService
      .commonServiceByUrlMethodData(url, method, postData)
      .subscribe((data: any) => {
        this.advanceData = data;
      })
  }

  getAdvance(p){
    p.advance = 0;
    this.advanceData.forEach(element => {
      let date : Date = new Date(element.updatedAt)
      if((date.getMonth()+1) == this.payroll.month){
        if(p._id == element.userid._id){
          p.advance = p.advance + element.property.amount;
        }
      }
    })
    return p.advance;
  }

  setSalaryComponent(pp: any) {
    if (pp.salarycomponents) {
      const salarycomponents = pp.salarycomponents.map(p => {
        const salarycomponent = this.payHeadList.find(x => x._id == p.salarycomponentid)
        return { ...salarycomponent, ...p }
      });

      pp.salarycomponents = salarycomponents
    }
  }

  setEarnedSalaryComponent(pp: any) {
    if (pp.salarycomponents) {
      pp.salarycomponents.forEach(salarycomponent => {
        //const salarycomponent = this.payHeadList.find(x => x._id == p.salarycomponentid)

        let computeValue: number = 0
        switch (salarycomponent.payHeadTypeID) {
          case 101:
            computeValue = salarycomponent.amount
            break;
          case 102:
            break;
          case 103:
            switch (salarycomponent.statutoryPayTypeID) {
              case 201:
                break;
              case 202:
                computeValue = this.getPayHeadTypeValue(pp.earnedSalarycomponents, [101])
                break;
              case 203:
                computeValue = this.getPayHeadTypeValue(pp.earnedSalarycomponents, [101])
                break;
              case 204:
                break;
              case 205:
                break;
              case 206:
                break;
              case 207:
                break;
              case 208:
                break;
              case 301:
                break;
              case 302:
                break;
              case 304:
                break;
              case 305:
                break;
              case 306:
                break;
              case 401:
                break;
              case 402:
                break;
              case 403:
                break;
              default:
              // code block
            }
            break;
          case 104:
            break;
          case 105:
            break;
          case 106:
            break;
          case 107:
            break;
          case 108:
            break;
          case 109:
            break;

          default:
          // code block
        }

        if (computeValue > 0) {
          pp.earnedSalarycomponents.push({ ...salarycomponent, amount: this.getComputatedValue(salarycomponent, computeValue, pp) })
        }
      });
    }
  }

  getComputatedValue(salarycomponent: any, value: number, p: any) {
    let computedValue: number = 0
    switch (salarycomponent.calculationTypeID) {
      case 501:
        let slab = salarycomponent.paySlabs.find(x => value >= x.amountGreaterThan && (x.amountUpTo === null || value < x.amountUpTo))
        if (slab) {
          let valueType: number = 1;
          if (slab.valueTypeID === 1002) {
            valueType = value * 0.01;
          }
          computedValue = Number(slab.value) * valueType;
        }
        break;
      case 502:
        break;
      case 503:
        computedValue = value;
        break;
      case 504:
        computedValue = (Number(value) / (p.monthDays)) * Number(p.paiddays);
        break;
      case 505:
        break;
      default:
      // code block
    }

    return + computedValue.toFixed(0);
  }

  getPayHeadTypeValue(salarycomponents: any, payHeadTypes: any) {
    if(salarycomponents){
    let value: number = 0

    let payHeadComponents = salarycomponents.filter(x => payHeadTypes.includes(x.payHeadTypeID))

    if (payHeadComponents.length > 0) {
      value = payHeadComponents.map(item => Number(item.amount)).reduce((prev, next) => prev + next);
    }
    return value
  }
  }

  getDeductionValue(p: any){
      let value: number = 0;
      if(p.salarycomponents){
        let deductionComponents = p.salarycomponents.filter(x => x.payHeadTypeID == 102)
        if (deductionComponents.length > 0) {
          value = deductionComponents.map(item => Number(item.amount)).reduce((prev, next) => prev + next);
        }
      }
      return value
  }

  getPayrollNetPay() {
    let netpay = 0
    if (this.payroll && this.payroll.employeesalary && this.payroll.employeesalary.length > 0) {
      netpay = this.payroll.employeesalary.map(item => Number(item.netonhand)).reduce((prev, next) => prev + next);
    }
    return netpay;
  }

  calculateSalary(e: any, item: any) {
    if (e) {
      let p = this.payroll.employeesalary.find(x => x._id === item._id)
      p.netonhand = ((Number(p.earnings) + Number(p.bonus)) - (Number(p.advance) + Number(p.deduction) + Number(p.taxamount))).toFixed(0);
    }
  }

  filter(){
    if(this.selectedCategory){
      this.payroll.employeesalary = [];
      this.userData.forEach(element => {
       this.employeesalary.forEach(ele => {
          if(ele._id == element._id){
              if(element.property.category == this.selectedCategory){
                this.payroll.employeesalary.push(ele)
              }
          }
        });
      })
    }
    this.dataSource = new MatTableDataSource()
    this.dataSource = new MatTableDataSource(this.payroll.employeesalary);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.isLoadingResults = false;
  }

  onCategorySelect(item:any)
  {
    this.selectedCategory = item;
    this.filter();
  }


  async savePayroll(payrollStatus) {
    const varTemp = this;
    swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to revert this !',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Confirm it!',
      cancelButtonText: 'No',
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false
    }).then((result) => {
      if (result.value) {

        this.submitted = true;
        this.payroll.status = payrollStatus;
        this._payrollService
          .AysncUpdate(this.payroll._id, this.payroll)
          .then(data => {
            if (data) {
              this.showNotification('top', 'right', 'Payroll has been saved successfully', 'success');
              this._router.navigate(['/pages/payroll-module/payroll-process/lists/']);
            }
          }).catch((e) => {
          }).finally(() => {
            this.submitted = false;
          });
      }
    });
  }

  exportAsExcel()
  {
    const ws: XLSX.WorkSheet=XLSX.utils.table_to_sheet(this.table.nativeElement);//converts a DOM TABLE element to a worksheet
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    /* save to file */
    XLSX.writeFile(wb, 'Payroll.xlsx');

  }

  setPage(page: number) {
    if (page < 1 || page > this.pager.totalPages) {
      return;
    }
    // this.pager = this._pagerService.getPager(this.employeesalary.length, page, this.selectedPageSize);
    // this.pagedItems = this.employeesalary.slice(this.pager.startIndex, this.pager.endIndex + 1);
  }
}
