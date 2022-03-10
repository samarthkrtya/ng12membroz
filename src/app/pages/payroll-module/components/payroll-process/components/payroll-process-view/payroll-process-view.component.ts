import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PagerService } from 'src/app/core/services/common/pager.service';
import { PayrollService } from 'src/app/core/services/payroll/payroll.service';
import { UsersService } from 'src/app/core/services/users/users.service';
import { BaseComponemntComponent } from 'src/app/shared/base-componemnt/base-componemnt.component';

 
@Component({
  selector: 'app-payroll-process-view',
  templateUrl: './payroll-process-view.component.html'
})
export class PayrollProcessViewComponent extends BaseComponemntComponent implements OnInit {

  bindid: any;
  payrolldetails: any = {};

  selectedMonth: any;
  selectedYear: any;

  employeesalary: any [] = [];
  userList:any
  username:any;

  //abc={name:'khushali','client','',10000,0,0,0,0,1,0,0,0,0,0,10000}
  //pagination
  pager: any = {};
  pager1: any = {};
  pagedItems: any[];
  pagedItem1: any[];
  selectedPageSize: number;
  totalPages = 0;


  constructor(
    private _route: ActivatedRoute,
    private _payrollService: PayrollService,
    private _pagerService: PagerService,
    private _userService: UsersService,

    )
     {
    super();
    this.pagename = "payroll-view";
    this._route.params.forEach((params) => {
      this.bindid = params["id"];
      
    });
   }

  async ngOnInit(){
    super.ngOnInit();

    try {
      await this.initializeVaraiable();
       await this.getPayrollDetailByid(this.bindid);
       await this.getuserDetail()
    } catch (error) {
      console.error( {error});
    } finally {
    }
  }

  async initializeVaraiable() {
    this.userList = []
    this.payrolldetails = {};
    this.employeesalary = [];
    this.selectedPageSize = 100;
    return;
  }

  getMonth(month: any) {
    var  months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return months[month - 1];
  }

  async getPayrollDetailByid(id: any) {
    console.log("bindid",id);    
    this.pagedItems = [];
    this.pager = {};
    let postData = {};
    postData["search"] = [];
    postData["search"].push({"searchfield": "status", "searchvalue": "paid", "criteria": "eq"});
    postData["search"].push({"searchfield": "_id", "searchvalue": id, "criteria": "eq"});

    return this._payrollService
      .AsyncGetByfilterLookupName(postData)
      .then(data=>{

        if(data) {
          if(data[0]) {
            this.payrolldetails = data[0];
            console.log(this.payrolldetails);            
            this.selectedMonth = this.payrolldetails.month;
            this.selectedYear = this.payrolldetails.year;
            this.employeesalary = this.payrolldetails.employeesalary;           
            if(this.employeesalary && this.employeesalary.length !== 0) {
              this.setPage(1);
            }
          }
          
        return;
        }
    })
  }


  async getuserDetail(){
      let url = "users/filter";
      let method = "POST"
      let postData = {};
      postData["search"] = [];
      postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });
  
      this._commonService
        .commonServiceByUrlMethodDataAsync(url, method, postData)
        .then((data: any) => {
          if (data && data.length > 0) {
            this.userList = data;
            console.log(this.userList);           
  
          }  
          this.userList.forEach(ele=>{
            this.employeesalary.forEach(element => {
                if(element.employeeid ? element.employeeid['_id'] : element._id == ele._id){
                  element.username = ele.fullname 
                  //console.log(ele.fullname);
                  
                 
                }           
          })
        })
        });
    }

 

  setPage(page: number) {
    if (page < 1 || page > this.pager.totalPages) {
      return;
    }
    this.pager = this._pagerService.getPager(this.employeesalary.length, page, this.selectedPageSize);
    this.pagedItems = this.employeesalary.slice(this.pager.startIndex, this.pager.endIndex + 1);
    //console.log(this.pagedItems);
  }

  
}
