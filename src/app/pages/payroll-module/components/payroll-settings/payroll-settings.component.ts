import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

import { CommonService } from '../../../../core/services/common/common.service';
import { BaseLiteComponemntComponent } from '../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import { element } from 'protractor';
import swal from 'sweetalert2';
import { isProtractorLocator } from 'protractor/built/locators';
import { MatTabChangeEvent } from '@angular/material/tabs';

@Component({
  selector: 'app-payroll-settings',
  templateUrl: './payroll-settings.component.html',
})

export class PayrollSettingsComponent extends BaseLiteComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();

  form: FormGroup;
  commissionsettingsForm: FormGroup;

  usersList: any[] = [];
  salaryCmpntList: any[] = [];

  membershipList: any[] = [];
  serviceList: any[] = [];

  dataContent: any;
  commissionType: any;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  @ViewChild('Paginator1',{read :MatPaginator}) paginator1: MatPaginator;
  @ViewChild(MatSort) sort1: MatSort;

  @ViewChild('Paginator2',{read :MatPaginator}) paginator2: MatPaginator;
  @ViewChild(MatSort) sort2: MatSort;

  @ViewChild('Paginator3' , {read : MatPaginator}) paginator3: MatPaginator;
  @ViewChild(MatSort) sort3: MatSort;

  dataSource = new MatTableDataSource;
  dataSource1 = new MatTableDataSource;
  dataSource2 = new MatTableDataSource;
  dataSource3 = new MatTableDataSource;

  ELEMENT_DATA: any[] = [];
  ELEMENT_DATA1: any[] = [];
  ELEMENT_DATA2: any[] = [];
  ELEMENT_DATA3: any[] = [];

  displayedColumns: any[] = [];
  displayedColumnsrow: any[] = [];
  displayedColumns1: any[] = [];
  displayedColumns2: string[] = [];
  displayedColumns3: string[] = [];
  displayedRow1: any[] = [];
  displayedRow2: any[] = [];
  displayedRow3: any[] = [];

  disableBtn: boolean = false;
  isLoadingData: boolean;

  payrollForm: FormGroup;
  payrollType: any[] = [
    { id: 1, name: "Salary Component"},
    { id: 2, name: "Hourly Rate" },
  ]
  selectedPayrollType: any;
  salaryComponents: any[] = []
  isDisableService: boolean = false;
  isSelectedPayrollType: boolean = false;
  isCommission : boolean = false;
  tabIndex : Number;
  isMembership: Boolean = false;
  constructor(
    private fb: FormBuilder,
    public _commonService: CommonService,
  ) {
    super();

    this.form = fb.group({
      'commissiontype': ['', Validators.required]
    });

    this.commissionsettingsForm = fb.group({
      'deductservicecost': [false],
      'deductproductcost': [false],
      'includetips': [false],
      'subtractdiscount': [false],
      'subtractpackagediscount': [false],
    })


  }

  async ngOnInit() {
    super.ngOnInit();
    await this.LoadData();
  }

  async LoadData() {
  //   await this.getSalaryComponent();
  this.tabIndex = this.isCommission ? 1 : 0;
  this.payrollForm = this.fb.group({
      'tierFArray': this.fb.array([])
    });

    this.isLoadingData = true;
    this.getPR();
    await this.getSC();
    await this.getUserData();
    await this.setTable();
    if(!this.dataContent){
      this.payrollType[0].checked = true;
      this.selectedPayrollType = this.payrollType[0].name;
     }else{
       this.selectedPayrollType = this.dataContent?.property?.payrolltype ? this.dataContent?.property?.payrolltype : this.payrollType[0].name;
       if(!this.dataContent?.property?.payrolltype) {
          this.payrollType[0].checked = true;
       }
       this.isSelectedPayrollType = true;

     }
    await this.setHourlyRate();
     
    

    this.isLoadingData = false;
    return;
  }

  async getSalaryComponent(){
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq"});

    let url = 'salarycomponents/filter';
    let method = 'POST';

    this._commonService.commonServiceByUrlMethodDataAsync(url, method, postData)
    .then((data: any ) => {
      this.salaryComponents = data
    })
  }
  
  tabChanged = async(tabChangeEvent: MatTabChangeEvent) => {
    this.tabIndex = tabChangeEvent.index;
    this.getCommissionData(this.tabIndex)
   
  }

  getCommissionData(index){
    if(index ==1 ){
      this.getMembership();
      this.getService();
      this.setCommission();
     }  
  }

  getPR() {
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "branchid", "searchvalue": this._loginUserBranchId, "criteria": "eq", "datatype": "ObjectId" });
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq"});


    let url = 'payrollsettings/filter';
    let method = 'POST';

    this._commonService
      .commonServiceByUrlMethodData(url, method, postData)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        if(data && data.length > 0){
          this.dataContent = data[0];
          this.form.controls['commissiontype'].setValue(this.dataContent.commissiontype);

          if (this.dataContent.commission) {
            this.commissionsettingsForm.controls['deductservicecost'].setValue(this.dataContent.commission.deductservicecost);
            this.commissionsettingsForm.controls['deductproductcost'].setValue(this.dataContent.commission.deductproductcost);
            this.commissionsettingsForm.controls['includetips'].setValue(this.dataContent.commission.includetips);
            this.commissionsettingsForm.controls['subtractdiscount'].setValue(this.dataContent.commission.subtractdiscount);
            this.commissionsettingsForm.controls['subtractpackagediscount'].setValue(this.dataContent.commission.subtractpackagediscount);
          }
          this.payrollType.forEach(element => {
            if(this.dataContent.property?.payrolltype == element.name){
              element.checked = true;
            }
          })
       }
      });
  }

  onItemSelect(val: any) {
    this.commissionType = val;
    this.membershipList.forEach(element => {
      this.dataSource2.filteredData.forEach(ele => {
        ele[element.membershipname+'_commission'] = null;
      });
    })
    this.serviceList.forEach(element => {
      this.dataSource3.filteredData.forEach(ele => {
        ele[element.codeName+'_commission'] = null;
      });
    })
    // this.serviceList.forEach(element => {
    //   this.dataSource2.filteredData.forEach(ele => {
    //     ele[element.membershipname+'_commission'] = null;
    //   });
    // })
    // if (val == 'Fixed' || val == 'Percentage') {
    //   if (val) {
    //     swal.fire({
    //       title: 'Are you sure?',
    //       text: 'All "Membership" and "Service" data will lost !',
    //       icon: 'warning',
    //       showCancelButton: true,
    //       confirmButtonText: 'Yes, Continue!',
    //       cancelButtonText: 'No',
    //       customClass: {
    //         confirmButton: "btn btn-success",
    //         cancelButton: "btn btn-danger",
    //       },
    //       buttonsStyling: false
    //     }).then((result) => {
    //       if (result.value) {
    //         // this.form.controls['commissiontype'].setValue(val);

    //         let model = {};
    //         model['commissiontype'] = val;
    //         model['membership'] = {};
    //         model['service'] = {};

    //         let url = 'payrollsettings';
    //         let id = this.dataContent && this.dataContent._id;
    //         let method = id ? 'PATCH' : 'POST';
    //         if(!id){
    //           model['frequency'] = "Monthly";
    //         }

    //         this.disableBtn = true;
    //         this._commonService
    //           .commonServiceByUrlMethodData(url, method, model, id)
    //           .subscribe(async (data: []) => {

    //             this.disableBtn = false;
    //             this.showNotification('top', 'right', 'Payment configure updated  !!', 'success');
    //             await this.LoadData();

    //           });

    //       } else {
    //         var st = ['Fixed', 'Percentage'].find(a => a != val);
    //         this.form.controls['commissiontype'].setValue(st);
    //       }
    //     });
    //   }
    // } else {
    //   let model = {};
    //   model['commissiontype'] = val;
    //   model['membership'] = {};
    //   model['service'] = {};

    //   let url = 'payrollsettings';
    //   let id = this.dataContent && this.dataContent._id;
    //   let method = id ? 'PATCH' : 'POST';
    //   if(!id){
    //     model['frequency'] = "Monthly";
    //   }

    //   this.disableBtn = true;
    //   this._commonService
    //     .commonServiceByUrlMethodData(url, method, model, id)
    //     .subscribe(async (data: []) => {
    //       this.disableBtn = false;
    //       this.showNotification('top', 'right', 'Payment configure updated  !!', 'success');
    //       await this.LoadData();

    //     });
    // }
  }

  async getSC() {
    let postData = {};
    postData["search"] = [];

    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq", "datatype": "text" });
    // postData["search"].push({ "searchfield": "affectNetSalaryOn", "searchvalue": true, "criteria": "eq", "datatype": "text" });

    let url = 'salarycomponents/filter';
    let method = 'POST';

    await this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        this.salaryCmpntList = [];
        this.salaryCmpntList = data;
        this.salaryCmpntList.map(a => a.codeName = a.displayName.replace(" ", ""));
      });
  }

  async getUserData() {

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq", "datatype": "text" });
    postData["sort"] = { "fullname": 1 };

    let url = 'users/filter';
    let method = 'POST';

    await this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: []) => {
        this.usersList = [];
        this.usersList = data;
      });
  }

  async setTable() {

    this.displayedColumns = [];
    this.displayedColumnsrow = [];

    this.ELEMENT_DATA = [];
    this.displayedColumnsrow = [ 'Employee','Designation'];
    this.displayedColumns.push({name : "Employee", type : "text" , fieldname : "username" });
    this.displayedColumns.push({name : "Designation", type : "text" , fieldname : "designation" });
    let salObj;
    this.salaryCmpntList.forEach(slc => {
      if(slc.payHeadTypeID === 101){
        this.displayedColumns.push({name : slc.codeName , type : 'input' , fieldname : slc.codeName+'Amount' , id : slc._id , payHeadId : slc.payHeadTypeID});
        this.displayedColumnsrow.push(slc.codeName);
      }
    });
    this.salaryCmpntList.forEach(slc => {
      if(slc.payHeadTypeID == 103){
        this.displayedColumns.push({name : slc.codeName , type : 'input' , fieldname : slc.codeName+'Amount' , id : slc._id , payHeadId : slc.payHeadTypeID});
        this.displayedColumnsrow.push(slc.codeName);
      }
    });
    this.salaryCmpntList.forEach(slc => {
      if(slc.payHeadTypeID == 104){
        this.displayedColumns.push({name : slc.codeName , type : 'input' , fieldname : slc.codeName+'Amount' , id : slc._id , payHeadId : slc.payHeadTypeID});
        this.displayedColumnsrow.push(slc.codeName);
      }
    });
    this.salaryCmpntList.forEach(slc => {
      if(slc.payHeadTypeID == 105){
        this.displayedColumns.push({name : slc.codeName , type : 'input' , fieldname : slc.codeName+'Amount' , id : slc._id , payHeadId : slc.payHeadTypeID});
        this.displayedColumnsrow.push(slc.codeName);
      }
    });
    this.displayedColumns.push({name : "Action", type : "action" });
    this.displayedColumnsrow.push('Action');
    this.usersList.forEach((user: any) => {    // userList
      salObj = {};
      this.salaryCmpntList.forEach(slc => { // salaryList
        let salcom, sall = slc;
        if (user.salarycomponents && user.salarycomponents.length > 0) {
          salcom = user.salarycomponents.find(a => a.salarycomponentid == sall._id)
        }
        salObj[`${sall.codeName}`] = sall;
        salObj[`${sall.codeName}Amount`] = salcom && salcom.amount ? +(salcom.amount) : 0;
      });
      salObj['userid'] = user;
      salObj['username'] = user && user.fullname ? user.fullname : '';
      salObj['designation'] = user && user.designationid && user.designationid.title ? user.designationid.title : '';
      salObj['isDisable'] = true;
      this.ELEMENT_DATA.push(salObj);
    });
    this.dataSource = new MatTableDataSource();
    this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
    return;
  }

  async setTable1() {

    this.displayedColumns = [];
    this.ELEMENT_DATA = [];

    this.displayedColumns = ['Employee', 'Designation'];
    let salObj;
    this.salaryCmpntList.forEach(slc => {
      this.displayedColumns.push(slc.codeName);
    });
    this.displayedColumns.push('Action');
    this.usersList.forEach((user: any) => {    // userList
      salObj = {};
      this.salaryCmpntList.forEach(slc => { // salaryList
        let salcom, sall = slc;
        if (user.salarycomponents && user.salarycomponents.length > 0) {
          salcom = user.salarycomponents.find(a => a.salarycomponentid == sall._id)
        }
        salObj[`${sall.codeName}`] = sall;
        salObj[`${sall.codeName}Amount`] = salcom && salcom.amount ? +(salcom.amount) : 0;
      });
      salObj['userid'] = user;
      salObj['username'] = user && user.fullname ? user.fullname : '';
    //  salObj['designation'] = user && user.designationid  &&  user.designationid.title ? user.designationid.title : user.designationid.designation   ? user.designationid.designation  : '';
      salObj['isDisable'] = true;
      this.ELEMENT_DATA.push(salObj);
    });
    this.dataSource = new MatTableDataSource();
    this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });

    return;
  }

  async setHourlyRate() {
    this.displayedColumns1 = [];
    this.ELEMENT_DATA1 = [];
    this.displayedRow1 = [];

    this.displayedRow1 = [{ code: 'userid', name: 'Employee', type: 'text' }];
    this.displayedRow1.push({ code: 'designation', name: 'Designation', 'type': 'text' });

    let salObj;
   
    this.displayedRow1.push({ code: 'houlyrate', name: 'Hourly Pay Rate', 'type': 'number', cost: null });
    this.displayedRow1.push({ code: 'action', name: 'Action', 'type': 'text' });

    this.usersList.forEach((user: any) => {
      salObj = {};
      salObj[`hourlyrate`] = user.hourlyrate ? Number(user.hourlyrate) : null;
      salObj['userid'] = user;
      salObj['username'] = user && user.fullname ? user.fullname : '' ;
      salObj['designation'] = user && user.designationid && user.designationid.title ? user.designationid.title : '';
      salObj['isDisable'] = true;
      this.ELEMENT_DATA1.push(salObj);
    });

    this.displayedColumns1 = this.displayedRow1.map(col => col.name);
    this.dataSource1 = new MatTableDataSource();
    this.dataSource1 = new MatTableDataSource(this.ELEMENT_DATA1);
    setTimeout(() => {
      this.dataSource1.paginator = this.paginator1;
      this.dataSource1.sort = this.sort1;
    });
    return;
  }

  getMembership() {
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq", "datatype": "text" });
    postData["sort"] = { "fullname": 1 };

    let url = 'memberships/filter';
    let method = 'POST';

    this._commonService
      .commonServiceByUrlMethodData(url, method, postData)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: []) => {
        this.membershipList = [];
        this.membershipList = data;
        this.membershipList.map(a => a.codeName = a.membershipname.replaceAll(" ", ""));
        this.setMembership();
      });
  }

  setMembership() {
    this.displayedColumns2 = [];
    this.ELEMENT_DATA2 = [];
    this.displayedRow2 = [];

    this.displayedRow2 = [{ code: 'userid', name: 'Employee', type: 'text' }];

    let salObj, payrollMembership, payrollEmp, commsnEmp;
    if (this.dataContent && this.dataContent.membership) {
      payrollMembership = [];
      payrollMembership = this.dataContent.membership;
    }
    this.membershipList.forEach(slc => {
      this.displayedRow2.push({ code: slc.codeName, name: slc.membershipname, 'type': 'number', cost: slc.property && slc.property.cost ? slc.property.cost : null });
    });
    this.displayedRow2.push({ code: 'action', name: 'Action', 'type': 'text' });

    this.usersList.forEach((user: any) => {
      salObj = {};
      if (payrollMembership && payrollMembership.employees && payrollMembership.employees.length > 0) {
        payrollEmp = payrollMembership.employees.filter(a => a.employeeid == user._id);
      }
      this.membershipList.forEach(memshp => {
        if (payrollEmp) {
          commsnEmp = payrollEmp.find(b => b.membershipid == memshp._id);
        }

        salObj[`${memshp.codeName}`] = memshp;
        salObj[`${memshp.codeName}_commission`] = commsnEmp && commsnEmp.commission ? +(commsnEmp.commission) : null;
      });
      salObj['userid'] = user;
      salObj['username'] = user && user.fullname ? user.fullname : '' ;
      salObj['isDisable'] = true;
      this.ELEMENT_DATA2.push(salObj);
    });

    this.displayedColumns2 = this.displayedRow2.map(col => col.name);
    this.dataSource2 = new MatTableDataSource();
    this.dataSource2 = new MatTableDataSource(this.ELEMENT_DATA2);
    this.isMembership = true
    setTimeout(() => {
      this.dataSource2.paginator = this.paginator2;
      this.dataSource2.sort = this.sort2;
    });
    return;
  }


  getService() {
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq", "datatype": "text" });

    let url = 'services/filter';
    let method = 'POST';

    this._commonService
      .commonServiceByUrlMethodData(url, method, postData)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: []) => {
        this.serviceList = [];
        this.serviceList = data;
        if(this.serviceList.length > 0){
          this.isDisableService = true;
        }
        this.serviceList.map(a => a.codeName = a.title.replaceAll(" ", ""));
        this.setService();
      });
  }

  setService() {
    this.displayedColumns3 = [];
    this.ELEMENT_DATA3 = [];
    this.displayedRow3 = [];

    this.displayedRow3 = [{ code: 'userid', name: 'Employee', type: 'text' }];

    let salObj, payrollService, payrollEmp, commsnEmp;
    if (this.dataContent && this.dataContent.service) {
      payrollService = [];
      payrollService = this.dataContent.service;
    }
    this.serviceList.forEach(slc => {
      this.displayedRow3.push({ code: slc.codeName, name: slc.title, 'type': 'number', cost: slc.charges ? slc.charges : null });
    });
    this.displayedRow3.push({ code: 'action', name: 'Action', 'type': 'text' });
    this.usersList.forEach((user: any) => {
      salObj = {};
      if (payrollService && payrollService.employees && payrollService.employees.length > 0) {
        payrollEmp = payrollService.employees.filter(a => a.employeeid == user._id);
      }
      this.serviceList.forEach(srvc => {
        if (payrollEmp) {
          commsnEmp = payrollEmp.find(b => b.serviceid == srvc._id);
        }
        salObj[`${srvc.codeName}`] = srvc;
        salObj[`${srvc.codeName}_commission`] = commsnEmp && commsnEmp.commission ? +(commsnEmp.commission) : null;
        if(salObj[`${srvc.codeName}_commission`] == null ){
          salObj[`${srvc.codeName}_commission`] = srvc.staff.find(x => x._id == user._id) ?  srvc.commission : null;
        }
      });
      salObj['userid'] = user;
      salObj['username'] = user && user.fullname ? user.fullname : '' ;
      salObj['isDisable'] = true;
      this.ELEMENT_DATA3.push(salObj);
    });

    this.displayedColumns3 = this.displayedRow3.map(col => col.name);
    this.dataSource3 = new MatTableDataSource();
    this.dataSource3 = new MatTableDataSource(this.ELEMENT_DATA3);
    setTimeout(() => {
      this.dataSource3.paginator = this.paginator3;
      this.dataSource3.sort = this.sort3;
    });
    return;
  }

  onClick(element){
    element.isDisable =  !element.isDisable;
    if(element.isDisable)
      this.LoadData();
  }

  applyFilter(event: any) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  applyFilter2(event: any) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource2.filter = filterValue.trim().toLowerCase();
    if (this.dataSource2.paginator) {
      this.dataSource2.paginator.firstPage();
    }
  }
  applyFilter3(event: any) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource3.filter = filterValue.trim().toLowerCase();
    if (this.dataSource3.paginator) {
      this.dataSource3.paginator.firstPage();
    }
  }

  async onSave(obj: any , userid : string) {
    let model = {};
    model['salarycomponents'] = [];
    for (const key in obj) {
      if (this.displayedColumnsrow.includes(key)) {
        model['salarycomponents'].push({
          'salarycomponentid': obj[key]['_id'],
          'amount': obj[`${key}Amount`],
          'amountannualy': obj[`${key}Amount`] * 12,
        });
      }
    }


    let url = 'users';
    let method = 'PATCH';
    

    this.disableBtn = true;
    await this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, model, userid)
      .then(async (data: []) => {
        this.disableBtn = false;
        this.showNotification('top', 'right', 'Payment configure updated  !!', 'success');
        await this.LoadData();
      });
  }

  async checkVal(array: any) {
    var ctype = this.form.get(['commissiontype']).value;
    if (!ctype) {
      return true;
    }
    if (ctype == 'Percentage') {
      var ind = array.findIndex(a => a.commission > 100);
      if (ind != -1) {
        return true;
      }
    }
    return;
  }

  async onSaveHourlyRate(obj: any,userid){
    
    let model = {};
    model['hourlyrate'] = "";
    for (const key in obj) {
      this.displayedRow1.forEach(element => {
        if(element.code == key){
          model['hourlyrate'] = obj.hourlyrate;
        }
      })
    }

    let url = 'users';
    let method = 'PATCH';

    this.disableBtn = true;
    await this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, model, userid)
      .then(async (data: []) => {
        this.disableBtn = false;
        this.showNotification('top', 'right', 'Payment configure updated  !!', 'success');
        await this.LoadData();
      });
  }

  async onSavePRMembership(obj: any) {
    // let commission;
    // let postData = {};
    // postData["search"] = [];
    // postData["search"].push({ "searchfield": "branchid", "searchvalue": this._loginUserBranchId, "criteria": "eq", "datatype": "ObjectId" });

    // let url1 = 'payrollsettings/filter';
    // let method1 = 'POST';

    // this._commonService
    //   .commonServiceByUrlMethodData(url1, method1, postData)
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe((data: any) => {
    //     console.log("Data 0 : ",data[0])
    //     commission = data[0].commissiontype
    //   })

    let model = {}, savedArray = [], savedObj;
    
    for (const key in obj) {
      savedObj = {};
      if (key != 'userid' && key != 'isDisable') {
        if (obj[key] && obj[key]['_id']) {
          savedObj['membershipid'] = obj[key]['_id'];
          savedObj['commission'] = obj[`${key}_commission`];
          savedObj['employeeid'] = obj['userid']['_id'];
          savedArray.push(savedObj);
          if(obj[key].property.cost <= obj[`${key}_commission`]){
            this.showNotification('top', 'right', 'Commission Should be Less than Membership fees !!', 'danger');
            return;
          }
        }
      }
    }
    // var validate = await this.checkVal(savedArray);
    // if (validate == true) {
    //   this.showNotification('top', 'right', 'Validation failed  !!', 'danger');
    //   return;
    // }
    let existEmp, existEmp2, nonexistEmp2 = [], needEmp = [];
    if (this.dataContent && this.dataContent.membership && this.dataContent.membership.employees && this.dataContent.membership.employees.length > 0) {
      existEmp = this.dataContent.membership.employees;
    }

    if (existEmp && existEmp.length > 0) {
      existEmp2 = existEmp.filter(a => a.employeeid == obj['userid']['_id']);
      nonexistEmp2 = existEmp.filter(a => a.employeeid != obj['userid']['_id']);

      if (existEmp2 && existEmp2.length > 0) {
        savedArray.forEach(ele => {
          var fnd = existEmp2.find(a => a.membershipid == ele.membershipid)
          if (fnd) {
            fnd['commission'] = ele['commission'];
            needEmp.push(fnd);
          } else {
            needEmp.push(ele);       
          }
        });
      } else {
        needEmp = savedArray;
      }
      if(this.commissionType == 'Fixed'){ 
      if (nonexistEmp2) needEmp.push(...nonexistEmp2);
      }
      else{
        model['service'] = {}
      }
    } else {
      needEmp = savedArray;
    }
    model['commissiontype'] = this.commissionType;
    model['membership'] = {};
    model['membership']['employees'] = [];
    model['membership']['employees'] = needEmp;
    this.dataContent.membership.employees.forEach(element => {
      if(element.membershipid)
      model['membership']['employees'].push(element)
    });
    let url = 'payrollsettings';
    let id = this.dataContent && this.dataContent._id;
    let method = id ? 'PATCH' : 'POST';
    if(!id){
      model['frequency'] = "Monthly";
    }

    this.disableBtn = true;
    await this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, model, id)
      .then(async (data: []) => {
        this.disableBtn = false;
        this.showNotification('top', 'right', 'Payment configure updated  !!', 'success');
        this.isCommission = true;
        await this.LoadData();

      });
  }

  async onSavePRService(obj: any) {
    // let commission;
    // let postData = {};
    // postData["search"] = [];
    // postData["search"].push({ "searchfield": "branchid", "searchvalue": this._loginUserBranchId, "criteria": "eq", "datatype": "ObjectId" });

    // let url1 = 'payrollsettings/filter';
    // let method1 = 'POST';

    // this._commonService
    //   .commonServiceByUrlMethodData(url1, method1, postData)
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe((data: any) => {
    //     commission = data[0].commissiontype
    //   })

    let model = {}, savedArray = [], savedObj;

    for (const key in obj) {
      savedObj = {};
      if (key != 'userid' && key != 'isDisable') {
        if (obj[key] && obj[key]['_id']) {
          savedObj['serviceid'] = obj[key]['_id'];
          savedObj['commission'] = obj[`${key}_commission`];
          savedObj['employeeid'] = obj['userid']['_id'];
          savedArray.push(savedObj);
          if(obj[key].charges <= obj[`${key}_commission`]){
            this.showNotification('top', 'right', 'Commission Should be Less than Service fees !!', 'danger');
            return;
          }
        }
      }
    }
    // var validate = await this.checkVal(savedArray);
    // if (validate == true) {
    //   this.showNotification('top', 'right', 'Validation failed  !!', 'danger');
    //   return;
    // }
    let existEmp, existEmp2, nonexistEmp2 = [], needEmp = [];
    if (this.dataContent.service && this.dataContent.service.employees && this.dataContent.service.employees.length > 0) {
      existEmp = this.dataContent.service.employees;
    }

    if (existEmp && existEmp.length > 0) {
      existEmp2 = existEmp.filter(a => a.employeeid == obj['userid']['_id']);
      nonexistEmp2 = existEmp.filter(a => a.employeeid != obj['userid']['_id']);

      if (existEmp2 && existEmp2.length > 0) {
        savedArray.forEach(ele => {
          var fnd = existEmp2.find(a => a.serviceid == ele.serviceid)
          if (fnd) {
            fnd['commission'] = ele['commission'];
            needEmp.push(fnd);
          } else {
            needEmp.push(ele);
          }
        });
      } else {
        needEmp = savedArray;
      }
      if( this.commissionType == 'Fixed'){ 
        if (nonexistEmp2) needEmp.push(...nonexistEmp2);
        }
        else{
          model['membership'] = {}
        }
    } else {
      needEmp = savedArray;
    }
    model['commissiontype'] = this.commissionType;
    model['service'] = {};
    model['service']['employees'] = [];
    model['service']['employees'] = needEmp;
    this.dataContent.service.employees.forEach(element => {
      if(element.serviceid)
      model['service']['employees'].push(element)
    });
    let url = 'payrollsettings';
    let id = this.dataContent && this.dataContent._id;
    let method = id ? 'PATCH' : 'POST';
    if(!id){
      model['frequency'] = "Monthly";
    }

    this.disableBtn = true;
    await this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, model, id)
      .then(async (data: []) => {
        this.disableBtn = false;
        this.showNotification('top', 'right', 'Payment configure updated  !!', 'success');
        this.isCommission = true;
        await this.LoadData();

      }).catch((e) => {
        console.log("e", e);
        this.disableBtn = false;
        this.showNotification('top', 'right', 'Something went wrong !!', 'danger');
      });
  }

  setCommission() {
    let lastTiergroup = [];
    let tierFArray = this.payrollForm.get('tierFArray') as FormArray;
    tierFArray.reset();
    if (this.dataContent && this.dataContent.tier && this.dataContent.tier.length > 0) {

      this.dataContent.tier.forEach((tr: any, ind: number) => {
        lastTiergroup = [];
        this.usersList.forEach(ele => {
          var trEmp = tr.employee.find(em => em.employeeid == ele._id);
          lastTiergroup.push(this.fb.group({
            'employeeid': [ele._id],
            'username': [ele.fullname],
            'commission': [trEmp && trEmp.commission ? trEmp.commission : 0],
          }));
        });

        tierFArray.push(this.fb.group({
          'minrev': new FormControl({ value: tr.minrev, disabled: true }),
          'maxrev': [tr.maxrev],
          'order': [tr.order],
          'employee': this.fb.array(lastTiergroup),
        }));
      });
    } else {
      this.usersList.forEach(ele => {
        lastTiergroup.push(this.fb.group({
          'employeeid': [ele._id],
          'username': [ele.fullname],
          'commission': [0],
        }));
      });
      tierFArray.push(this.fb.group({
        'minrev': new FormControl({ value: 0, disabled: true }),
        'maxrev': [0],
        'order': [0],
        'employee': this.fb.array(lastTiergroup),
      }));
    }
  }

  onAddTier() {
    let lastTierArray = this.payrollForm.get('tierFArray') as FormArray;
    let len = lastTierArray.controls.length;
    let lastTierGroup = lastTierArray.controls[len - 1] as FormGroup;
    let val = lastTierGroup.getRawValue();
    if (!val.maxrev) {
      this.showNotification('top', 'right', 'Enter previous tier max range  !!', 'danger');
      return;
    }
    let lastTiergroup = [];
    this.usersList.forEach(ele => {
      lastTiergroup.push(this.fb.group({
        'employeeid': [ele._id],
        'username': [ele.fullname],
        'commission': [0],
      }));
    });
    lastTierArray.push(this.fb.group({
      'minrev': new FormControl({ value: val.maxrev + 1, disabled: true }),
      'maxrev': [0],
      'employee': this.fb.array(lastTiergroup),
      'order': [len + 1],
    }))

  }


  onDeleteTier(i: number) {
    var arr = this.payrollForm.get('tierFArray') as FormArray;
    arr.removeAt(i);
    arr.controls.forEach((fg: FormGroup, i: number) => {
      if (i > 0) {
        fg.controls['minrev'].setValue(arr.controls[i - 1].get('maxrev').value + 1);
        fg.controls['maxrev'].setValue(arr.controls[i].get('maxrev').value);
        fg.controls['order'].setValue(i + 1);
      }
    });
  }

  async onSubmit() {
    var needToSave = [];
    var tier = this.payrollForm.controls['tierFArray'] as FormArray;
    tier.controls.forEach((fg: FormGroup, ind: number) => {
      needToSave.push({ 'minrev': fg.get('minrev').value, 'maxrev': fg.get('maxrev').value, 'order': fg.get('order').value, 'employee': fg.get('employee').value });
    });

    var model = {};
    model['tier'] = [];
    model['tier'] = needToSave;

    let url = 'payrollsettings';
    let id = this.dataContent && this.dataContent._id;
    let method = id ? 'PATCH' : 'POST';
    if(!id){
      model['frequency'] = "Monthly";
    }

    this.disableBtn = true;
    await this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, model, id)
      .then(async (data: []) => {
        this.disableBtn = false;
        this.showNotification('top', 'right', 'commission revenue configure updated  !!', 'success');
        tier.reset();
        await this.LoadData();


      }).catch((e) => {
        this.disableBtn = false;
        this.showNotification('top', 'right', 'Something went wrong !!', 'danger');
      });


  }

  async onSubmitSettings(value: any, valid: boolean) {

    var model = {};
    model['commission'] = {};
    model['commission'] = {
      deductservicecost: value.deductservicecost,
      deductproductcost: value.deductproductcost,
      includetips: value.includetips,
      subtractdiscount: value.subtractdiscount,
      subtractpackagediscount: value.subtractpackagediscount
    };


    let url = 'payrollsettings';
    let id = this.dataContent && this.dataContent._id;
    let method = id ? 'PATCH' : 'POST';
    if(!id){
      model['frequency'] = "Monthly";
    }
    this.disableBtn = true;
    await this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, model, id)
      .then(async (data: []) => {
        this.disableBtn = false;
        this.showNotification('top', 'right', 'commission revenue configure updated  !!', 'success');
        await this.LoadData();

      }).catch((e) => {
        this.disableBtn = false;
        this.showNotification('top', 'right', 'Something went wrong !!', 'danger');
      });


  }

  valueChanged(value: Number, item: any, element: any) {
    if (value) {
      this.salaryCmpntList.forEach(element => {
        element.amount = 0
        if (element._id == item.id) {
          element.amount = value.toFixed(0);
        }
      });
    }
    this.calculatePayHead(this.salaryCmpntList,element);
      this.salaryCmpntList.forEach(ele => {
        if(ele.payHeadTypeID == 103){
          if(ele?._id == element[ele.codeName]?._id){
            element[ele.codeName+'Amount'] = ele.amount.toFixed(0)
          }
        }
      })
      this.salaryCmpntList.forEach(ele => {
        if(ele.payHeadTypeID == 104){
          if(ele?._id == element[ele.codeName]?._id){
            element[ele.codeName+'Amount'] = ele.amount.toFixed(0)
          }
        }
      })
      this.salaryCmpntList.forEach(ele => {
        if(ele.payHeadTypeID == 105){
          if(ele?._id == element[ele.codeName]?._id){
            element[ele.codeName+'Amount'] = ele.amount.toFixed(0)
          }
        }
      })
  }

  calculatePayHead(revision: any,element) {
    let grossEarning = 0
    let epfEarning = 0
    let esiEarning = 0
   
    let grossEarningComponents = this.salaryCmpntList.filter(x => x.payHeadTypeID === 101)
    let epfEarningComponents = this.salaryCmpntList.filter(x => x.considerforEPFContributionOn === true)
    let esiEarningComponents = this.salaryCmpntList.filter(x => x.considerforESIContributionOn === true)
    if (grossEarningComponents.length > 0) {
      grossEarningComponents.forEach(ele => {
        if(ele.payHeadName == element[ele.codeName].payHeadName){
          ele.amount = element[ele.codeName+'Amount']
        }
      })
      grossEarning = grossEarningComponents.map(item => Number(item.amount)).reduce((prev, next) => prev + next);
    }
    if (epfEarningComponents.length > 0) {
      epfEarning = epfEarningComponents.map(item => Number(item.amount)).reduce((prev, next) => prev + next);
    }
    if (esiEarningComponents.length > 0) {
      esiEarning = esiEarningComponents.map(item => Number(item.amount)).reduce((prev, next) => prev + next);
    }
    this.salaryCmpntList.forEach(element => {
      if (element.calculationTypeID === 501) {
        switch (element.statutoryPayTypeID) {
          case 202: {
            //Professional Tax; 
            element.amount = this.getComputatedValue(Number(grossEarning), element.paySlabs);
            break;
          }
          case 203: {
            //PF Account (A/c No. 1);
            element.amount = this.getComputatedValue(Number(epfEarning), element.paySlabs);
            break;
          }
          case 205: {
            //Employee State Insurance; 
            element.amount = this.getComputatedValue(Number(esiEarning), element.paySlabs);
            break;
          }
          case 301: {
            //Employer's PF Account (A/c No. 1);
            element.amount = this.getEmployerComputatedValue(Number(epfEarning), element.paySlabs);
            break;
          }
          case 302: {
            // EMployer PF Account EPS(A/c No. 1);
            element.amount = this.getEmployerComputatedValue(Number(epfEarning), element.paySlabs);
            break;
          }
          case 303: {
            // EMployer PF Account EPS(A/c No. 1);
            element.amount = this.getESIComputatedValue(Number(esiEarning), element.paySlabs);
            break;
          }
          default: {
            element.amount = this.getComputatedValue(Number(grossEarning), element.paySlabs);
            break;
          }
        }
      }
    });
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
  
  async onPayrollTypeChanged(value){
    this.selectedPayrollType = value.name;
  }

  async onSavePayrollData(){
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
    }).then(async (result) => {
      if (result.value) {

    let url = 'payrollsettings';
    let id = this.dataContent && this.dataContent._id;
    let method = id ? 'PATCH' : 'POST';
        let services:any = []
    this.serviceList.forEach(element => {
      this.usersList.forEach(user => {
        if(element.staff.find(x => x._id == user._id)){
          services.push({
            serviceid: element._id,
            commission : element.commission,
            employeeid: user._id
          })
        }
      })
    })
    var model = {};
    model["property"] = {};
    if(!id){
      model['frequency'] = "Monthly";
      model["property"]["payrolltype"] = this.selectedPayrollType;
      model['service'] = {};
      model['service']['employees'] = [];
      model['service']['employees'] = services;
    }else{
      model["property"]["payrolltype"] = this.selectedPayrollType;
    }
    this.disableBtn = true;
    await this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, model, id)
      .then(async (data: []) => {
        this.disableBtn = false;
        this.showNotification('top', 'right', 'Payroll Type changed !!', 'success');
        this.LoadData();
      }).catch((e) => {
        this.disableBtn = false;
        this.showNotification('top', 'right', 'Something went wrong !!', 'danger');
      });
      }
    });
   
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }


}
