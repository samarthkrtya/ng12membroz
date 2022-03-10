import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { BaseComponemntComponent } from 'src/app/shared/base-componemnt/base-componemnt.component';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-user-salary-details',
  templateUrl: './user-salary-details.component.html'
})
export class UserSalaryDetailsComponent extends BaseComponemntComponent implements OnInit {
  payHeadList : any
  userData: any
  onDisplay: boolean = false
  payrollData: any[] = [];
  totalAmountMonthly: any = 0;
  totalAmountAnnualy: any = 0;
  costToAmountMonthly: any = 0;
  costToAmountAnnualy: any = 0;
  onModalShow: any;
  selectedMonth: any;
  isShow: boolean = false;
  months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  logoPath: any;

  @ViewChild('content', {static: false}) content: ElementRef;

  constructor() {
    super();
   }

  async ngOnInit() {
    this._loginUser = this._authService.currentUser.user;
    this.bindId = this._loginUser._id;
    await this.getAllSalaryComponent();
    await this.getUserData();
    await this.calculateTotal();
    await this.salaryData();
  }

  async getAllSalaryComponent() {
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" })
    var url = "salarycomponents/filter"
    var method = "POST"
    return this._commonService
    .commonServiceByUrlMethodDataAsync(url,method,postData)
    .then(data => {
        if (data) {
          this.payHeadList = data
        }
      })
  }

  async getUserData(){
    this.onDisplay = true;
    this.userData = this._loginUser
      this.userData.salarycomponents.forEach(element => {
        element.salarycomponent = this.payHeadList.find(a=>a._id == element.salarycomponentid);
        element.amountAnnually = element.amount * 12;
      });      
  }

  calculateTotal() {
    let netEarning: number = 0
    let netDeduction: number = 0
    let netContribution: number = 0
    let netEarningComponents = this.userData.salarycomponents.filter(x => x.salarycomponent.payHeadTypeID === 101)
    let netDeductionComponents = this.userData.salarycomponents.filter(x => x.salarycomponent.payHeadTypeID === 102 || x.salarycomponent.payHeadTypeID === 103)
    let epfComponent = this.userData.salarycomponents.filter(x => x.salarycomponent.statutoryPayTypeID === 203)
    let netContributionComponents = []
    // if (!epfComponent){
    //   netContributionComponents = epfComponent.subComponents
    // }

    if (netEarningComponents.length > 0) {
      netEarning = netEarningComponents.map(item => Number(item.amount)).reduce((prev, next) => prev + next);
    }
    if (netDeductionComponents.length > 0) {
      netDeduction = netDeductionComponents.map(item => Number(item.amount)).reduce((prev, next) => prev + next);
    }
    if (netContributionComponents.length > 0) {
      netContribution = netContributionComponents.map(item => Number(item.amount)).reduce((prev, next) => prev + next);
    }
    this.totalAmountMonthly = netEarning - netDeduction
    this.totalAmountAnnualy = this.totalAmountMonthly * 12
    this.costToAmountMonthly = netEarning + netContribution + netDeduction;
    this.costToAmountAnnualy = this.costToAmountMonthly * 12
  }

  async salaryData() {
   
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "paid", "criteria": "eq"});

    var url = "payrolls/filter"
    var method = "POST"

    return this._commonService.commonServiceByUrlMethodData(url, method, postData)
      .subscribe((data : any) => {
        if(data){
        this.payrollData = data;
        console.log("Payroll data : ",this.payrollData)
        this.payrollData.forEach(element => {
          element.employeesalary.forEach(ele => {
            if(ele?._id == this._authService.currentUser._id){
              element.earning = ele.netonhand;
              element.salary = ele.actualsalary
              element.salaryComponent = ele.salarycomponents
              element.netonhand = ele.netonhand
              element.bonus = ele.bonus
            }
          });
        });
        return;
        }
      })
 
  }

  public downloadPDF(p) {
    this.isShow = true
    this.selectedMonth = p

    setTimeout(() => {
    this.logoPath = this._authService.currentUser.user.branchid.branchlogo;
    const doc = new jsPDF();
    const specialElementHandlers = {
      '#editor': function (element, renderer) {
        return true;
      }
    };
    const pdfTable = this.content.nativeElement;
    doc.fromHTML(pdfTable.innerHTML, 15, 15, {
      width: 190,
      'elementHandlers': specialElementHandlers
    });
    doc.save('SalarySlip.pdf');
    }, 1);

  }


  onModal(p){
      this.onModalShow = true
      this.selectedMonth = p
  }
}
