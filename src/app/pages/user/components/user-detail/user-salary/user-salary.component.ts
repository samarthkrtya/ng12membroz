import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserModel } from 'src/app/core/models/auth/user.model';
import { RoleService } from 'src/app/core/services/role/role.service';
import { salarycomponentService } from 'src/app/core/services/salarycomponents/salarycomponents.service';
import { UsersService } from 'src/app/core/services/users/users.service';
import { BaseComponemntComponent } from 'src/app/shared/base-componemnt/base-componemnt.component';

@Component({
  selector: 'app-user-salary',
  templateUrl: './user-salary.component.html'
})

export class UserSalaryComponent extends BaseComponemntComponent implements OnInit {
  submitted: boolean = false;

  @Input() bindId: any;
  @Input() dataContent: any;

  _userModel = new UserModel();
  payHeadList: any;
  salarycomponents: any[] = [];
  selectedPayHeadList: any[] = [];
  revisionList: any[] = [];
  addRevisionClick: boolean = false;

  totalAmountMonthly: any = 0;
  totalAmountAnnualy: any = 0;
  costToAmountMonthly: any = 0;
  costToAmountAnnualy: any = 0;

  constructor(private _usersService: UsersService,
    private _route: ActivatedRoute,
    public _roleService: RoleService,
    private _salaryComponentService: salarycomponentService) {
    super();
  }

  async ngOnInit() {
    try {
      await this.initializeVariables();
      await this.getAllSalaryComponent();
      await this.getStaffDetailsById(this.bindId);
    }
    catch (error) {
      console.log(error);
    } finally {
    }
  }

  async initializeVariables() {
    this.payHeadList = [];
    this.revisionList = [];
  }

  Save() { }
  Update() { }
  Delete() { }
  ActionCall() { }

  async getStaffDetailsById(id) {
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "_id", "searchvalue": id, "criteria": "eq", "datatype": "objectid" });

    var url = "users/filter"
    var method = "POST"
    return this._commonService.commonServiceByUrlMethodData(url, method, postData)
      .subscribe(data => {
        if (data && data[0]) {
          this._userModel = data[0];
          this.salarycomponents = this._userModel.salarycomponents;
          if (!this.salarycomponents) {
            this.salarycomponents = [];
          }
          this.salarycomponents.forEach(component => {
            let salarycomponent = this.payHeadList.find(x => x._id === component.salarycomponentid)
            if(salarycomponent){
              component.payHeadName = salarycomponent.payHeadName
              component.displayName = salarycomponent.displayName
              component.payHeadTypeID = salarycomponent.payHeadTypeID
              component.statutoryPayTypeID = salarycomponent.statutoryPayTypeID
              component.incomeTypeID = salarycomponent.incomeTypeID
              component.calculationTypeID = salarycomponent.calculationTypeID
              component.attendanceTypeID = salarycomponent.attendanceTypeID
              component.productionUnitID = salarycomponent.productionUnitID
              component.calculationPeriodID = salarycomponent.calculationPeriodID
              component.perDayCalculationBasisID = salarycomponent.perDayCalculationBasisID
              component.userdefinedDays = salarycomponent.userdefinedDays
              component.computationMethodID = salarycomponent.computationMethodID
              component.computeformula = salarycomponent.computeformula
              component.canMakePartOfEmployeeSalaryStructureOn = salarycomponent.canMakePartOfEmployeeSalaryStructureOn
              component.roundingMethodID = salarycomponent.roundingMethodID
              component.roundingLimit = salarycomponent.roundingLimit
              component.paySlabs = salarycomponent.paySlabs;
              component.affectNetSalaryOn = salarycomponent.affectNetSalaryOn;
              component.canrecurringSubequentPayrollsOn = salarycomponent.canrecurringSubequentPayrollsOn;
              component.taxableComponentOn = salarycomponent.taxableComponentOn;
              component.considerforEPFContributionOn = salarycomponent.considerforEPFContributionOn;
              component.considerforESIContributionOn = salarycomponent.considerforESIContributionOn;
              component.considerforGratuityOn = salarycomponent.considerforGratuityOn;
              component.canShowInPayslipOn = salarycomponent.canShowInPayslipOn;
              component.amountAnnually = Number(component.amount * 12).toFixed(2);
            }
          })
          this.calculateTotal(this.salarycomponents)
          this.refreshSelectedPayHeads(this.salarycomponents)
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
          this.payHeadList = [];
          this.payHeadList = data;
          this.selectedPayHeadList = this.payHeadList
        }
      })
  }

  valueChanged(value: Number, item: any) {
    if (value) {
      this.salarycomponents.forEach(element => {
        if (element._id == item._id) {
          element.amount = value;
          element.amountAnnually = element.amount * 12;
        }
      });
    }
    this.calculatePayHead(this.salarycomponents);
    this.calculateTotal(this.salarycomponents);
    
  }

  calculatePayHead(revision: any) {
    let grossEarning = 0
    let epfEarning = 0
    let esiEarning = 0
    let grossEarningComponents = this.salarycomponents.filter(x => x.payHeadTypeID === 101)
    let epfEarningComponents = this.salarycomponents.filter(x => x.considerforEPFContributionOn === true)
    let esiEarningComponents = this.salarycomponents.filter(x => x.considerforESIContributionOn === true)

    if (grossEarningComponents.length > 0) {
      grossEarning = grossEarningComponents.map(item => Number(item.amount)).reduce((prev, next) => prev + next);
    }
    if (epfEarningComponents.length > 0) {
      epfEarning = epfEarningComponents.map(item => Number(item.amount)).reduce((prev, next) => prev + next);
    }
    if (esiEarningComponents.length > 0) {
      esiEarning = esiEarningComponents.map(item => Number(item.amount)).reduce((prev, next) => prev + next);
    }

    this.salarycomponents.forEach(element => {
      if (element.calculationTypeID === 501) {
        switch (element.statutoryPayTypeID) {
          case 202: {
            //Professional Tax; 
            element.amount = this.getComputatedValue(Number(grossEarning), element.paySlabs).toFixed(0);
            element.amountAnnually = element.amount * 12;
            break;
          }
          case 203: {
            //PF Account (A/c No. 1);
            element.amount = this.getComputatedValue(Number(epfEarning), element.paySlabs).toFixed(0);
            element.amountAnnually = element.amount * 12;
            break;
          }
          case 205: {
            //Employee State Insurance; 
            element.amount = this.getComputatedValue(Number(esiEarning), element.paySlabs).toFixed(0);
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
            element.amount = this.getComputatedValue(Number(grossEarning), element.paySlabs).toFixed(0);
            element.amountAnnually = element.amount * 12;
            break;
          }
        }
      }
    });
    this.calculateTotal(this.salarycomponents)
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

  getComputatedValue(value: number, paySlabs: any) {
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

  calculateTotal(revision) {
    let netEarning: number = 0
    let netDeduction: number = 0
    let netContribution: number = 0
    let netEarningComponents = this.salarycomponents.filter(x => x.payHeadTypeID === 101)
    let netDeductionComponents = this.salarycomponents.filter(x => x.payHeadTypeID === 102 || x.payHeadTypeID === 103)
    let epfComponent = this.salarycomponents.filter(x => x.statutoryPayTypeID === 203)
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
    this.costToAmountMonthly = netEarning + netContribution ;
    this.costToAmountAnnualy = this.costToAmountMonthly * 12
  }

  addNewSalaryComponent(salarycomponent: any, payHeadList: any) {
    this.salarycomponents.push({ salarycomponentid: salarycomponent._id, ...salarycomponent })
    if (salarycomponent.statutoryPayTypeID == 203) {
      let subComponents = this.payHeadList.filter(x => x.statutoryPayTypeID === 301 || x.statutoryPayTypeID === 302 || x.statutoryPayTypeID === 401 || x.statutoryPayTypeID === 402)
      subComponents.forEach(element => {
        this.salarycomponents.push({ salarycomponentid: element._id, ...element })
      });
    }
    if (salarycomponent.statutoryPayTypeID == 205) {
      let subComponents = this.payHeadList.filter(x => x.statutoryPayTypeID === 303)
      subComponents.forEach(element => {
        this.salarycomponents.push({ salarycomponentid: element._id, ...element })
      });
    }
    
    this.refreshSelectedPayHeads(this.salarycomponents);
    this.calculatePayHead(this.salarycomponents)
    this.calculateTotal(this.salarycomponents);
  }

  uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    })
  }

  refreshSelectedPayHeads(payHeadList: any) {
    this.selectedPayHeadList = [];
    this.payHeadList.forEach(payHead => {
      let found: boolean = payHeadList.some(x => x.salarycomponentid === payHead._id)
      if (!found) {
        this.selectedPayHeadList.push(payHead);
      }
    });
  }

  deleteComponent(salarycomponent: any) {
    this.salarycomponents = this.salarycomponents.filter(x => x.salarycomponentid !== salarycomponent.salarycomponentid)
    if (salarycomponent.statutoryPayTypeID === 203) {
      let subComponents = this.payHeadList.filter(x => x.statutoryPayTypeID === 301 || x.statutoryPayTypeID === 302 || x.statutoryPayTypeID === 401 || x.statutoryPayTypeID === 402)
      subComponents.forEach(element => {
        this.salarycomponents = this.salarycomponents.filter(x => x.salarycomponentid !== element._id)
      });
    }
    this.refreshSelectedPayHeads(this.salarycomponents)
    this.calculateTotal(this.salarycomponents)
  }

  onSalaryDetailsSubmit(salarycomponents) {
    this.submitted = true

    let salaryObj: any[] = []
    salarycomponents.forEach(element => {
      salaryObj.push({
        salarycomponentid: element.salarycomponentid,
        amount: element.amount
      })
    });
    let user = { salarycomponents: salaryObj }

    this._usersService
      .UpdateSalaryComponentAsync(this.bindId, user)
      .then(data => {
        if (data) {
          this.showNotification('top', 'right', 'Salary details has been saved successfully', 'success');
          this._router.navigate(['/pages/dynamic-list/list/user', this.bindId]);
        }
      })
      .catch((e) => { })
      .finally(() => {
        this.submitted = false;
      });
  }
}
