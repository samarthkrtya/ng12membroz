import { CommonService } from './../../core/services/common/common.service';

import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { AuthService } from '../../core/services/common/auth.service';


declare var $:any;

@Component({
  selector: 'app-dynamic-dashboard',
  templateUrl: './dynamic-dashboard.component.html',
})
export class DynamicDashboardComponent  implements OnInit, AfterViewInit{

    dbid : any;
    dateParams: any = {};
    dateParamsMemberCount: any = {};

    calendarVisibility = false;
    startdate: any ;
    enddate: any ;

    dashboardrows: any[] = [];
     roletype: string = '';
     currentRoleDetail: any;
    isstupdn:boolean =  true;
    isdataLoading:boolean =  false;
    adminMenusId: string = '';
    noDashboardPermission = false;

    daterangepickermodel: any = {
        beginJsDate: '',
        endJsDate: ''
    };
    today: Date = new Date();
    isMob = false;

    memberformid: string;
    userformid: string;
    resortformid: string;
    bookingformid: string;
    paymentid: string;


    memberformname: string;
    userformname: string;
    paymentname: string;

    bookingView: boolean = false;

    globalFilter: boolean = false;
    cSolutionType: string;
    // isgettLoad: boolean = false;

    branchList : any[] = [];
    selectedBranchName: string = 'ALL Branch';
    selectedBranch: any;
    isAllBranchViewPermission: any;

    userbranch: any;
    selectedPeriod: string = "ALL";
    constructor(
        private  route : ActivatedRoute,
        private _authService: AuthService,
        private _commonService: CommonService,
    ) {
      //this.getAllBranch();
      this.cSolutionType = '';
      //this.memberFormDetails()
      this.daterangepickermodel.beginJsDate = new Date(new Date().setFullYear((this.today.getFullYear() - 1)));
      this.daterangepickermodel.endJsDate = new Date();
      this.daterangepickermodel.beginDate = {
        year: new Date().getFullYear()-1,
        month: new Date().getMonth(),
        day: new Date().getDate()
      };

      this.daterangepickermodel.endDate = {
        year: new Date().getFullYear(),
        month: new Date().getMonth(),
        day: new Date().getDate()
      };


      this.dateParams.fromdate = null;
      this.dateParams.todate = null;
      this.dateParams.branchid = null;

      if(this.isMobileMenu()){
        this.isMob = true;
      } else {
        this.isMob = false;
      }

      if(this._authService.currentUser) {
        
        if(this._authService.currentUser.user != undefined && this._authService.currentUser.user.branchid != undefined ){
          this.userbranch = this._authService.currentUser.user.branchid;
        }
        if(this._authService.currentUser.user != undefined && this._authService.currentUser.user.branchid != undefined && this._authService.currentUser.user.branchid.solutiontype != undefined){
            this.cSolutionType = this._authService.currentUser.user.branchid.solutiontype;
        }
        // if(this._authService.currentUser != undefined && this._authService.currentUser.role != undefined && this._authService.currentUser.role['dashboard'] != undefined){
        //    this.dashboardrows = this._authService.currentUser.role['dashboard']['rows'];
        // } else {
        //   this.noDashboardPermission = true;
        // }
        if(this._authService.currentUser != undefined && this._authService.currentUser.role != undefined){
          this.currentRoleDetail = this._authService.currentUser.role;
          this.globalFilter = false;
          if(this.currentRoleDetail.dashboard && this.currentRoleDetail.dashboard.globalfilter){
            this.globalFilter = true;
          }
          
          this.currentRoleDetail.permissions.forEach((element) => {
            if (element.formname == "branch") {
              if (element.recordpermission) {
                if (element.recordpermission.length !== 0) {
                  element.recordpermission.forEach((ele) => {
                    if (ele.type == "view") {
                      if(ele.datapermission != undefined && ele.datapermission == 'All'){
                        this.isAllBranchViewPermission = true;
                      } else {
                        this.isAllBranchViewPermission = false;
                      }
                    }

                  });
                }
              }

            }
          });
        }
      }
 }


  ngOnInit() {

    this.route.params.forEach(params => {

    this.dbid = params['dbid'];
    if(this.dbid !== undefined){
       this.getDBRowInfoByid(this.dbid);
    } else {
      if(this._authService.currentUser != undefined && this._authService.currentUser.role != undefined && this._authService.currentUser.role['dashboard'] != undefined){
        this.dashboardrows = this._authService.currentUser.role['dashboard']['rows'];
      } else {
        this.noDashboardPermission = true;
      }
    }

    const currentDate: Date = new Date(Date.now());

    this.dateParamsMemberCount.fromdate = new Date(new Date().setDate((currentDate.getDate() - 365)));
    this.dateParamsMemberCount.todate = currentDate;

    this.dateParams.fromdate = null;
    this.dateParams.todate = null;
    this.dateParams.branchid = null;

    this.startdate = '';
    this.enddate = '';

    });
  }

  dateRangeChange(dateRangeStart: HTMLInputElement, dateRangeEnd: HTMLInputElement) {
    if(dateRangeStart.value && dateRangeEnd.value) {
      //this.reloadList();
    }
  }

  getDBRowInfoByid(did : any){
    this.isdataLoading = true;
    this._commonService
    .commonServiceByUrlMethodIdOrData('dashboard/','GET', did)
    .subscribe(data =>{
      if(data){
        
          let dashboardDetail: any = data;
          if(dashboardDetail != undefined && dashboardDetail.rows != undefined){
              this.dashboardrows = dashboardDetail.rows;
          } else {
            this.noDashboardPermission = true;
          }
          this.isdataLoading = false;
      } else {
        this.noDashboardPermission = true;
        this.isdataLoading = false;
      }
  }, dt => {
    this.noDashboardPermission = true;
    this.isdataLoading = false;
  });
}

 onSelectValue( selectedValue: string) {
   
     this.isdataLoading = true;
     const currentDate: Date = new Date(Date.now());
      if(selectedValue == 'Last 1 Month') {
        this.calendarVisibility = false;

        this.dateParams.fromdate = new Date(new Date().setDate((currentDate.getDate() - 30)));
        this.dateParams.todate = currentDate;


        setTimeout(()=> {
             this.isdataLoading = false;
        }, 50);

      } else if(selectedValue == 'Last 3 Months') {
        this.calendarVisibility = false;

        this.dateParams.fromdate = new Date(new Date().setDate((currentDate.getDate() - 90)));
        this.dateParams.todate = currentDate;

          setTimeout(()=> {
          this.isdataLoading = false;
          }, 50);
      } else if(selectedValue == 'Last 6 Months') {
        this.calendarVisibility = false;

        this.dateParams.fromdate = new Date(new Date().setDate((currentDate.getDate() - 180)));
        this.dateParams.todate = currentDate;

          setTimeout(()=> {
          this.isdataLoading = false;
         }, 50);
      } else if(selectedValue == 'Last 12 Months') {
        this.calendarVisibility = false;

        this.dateParams.fromdate = new Date(new Date().setDate((currentDate.getDate() - 365)));
        this.dateParams.todate = currentDate;

         setTimeout(()=> {
          this.isdataLoading = false;
         }, 50);
      } else if(selectedValue == 'ALL') {
        this.calendarVisibility = false;

        this.dateParams.fromdate = null;
        this.dateParams.todate = null;


          setTimeout(()=> {
          this.isdataLoading = false;
         }, 50);
      } else if(selectedValue == 'Today') {
        this.calendarVisibility = false;

        this.dateParams.fromdate = new Date(new Date().setDate((currentDate.getDate() - 1)));
        this.dateParams.todate = currentDate;

          setTimeout(()=> {
          this.isdataLoading = false;
          }, 50);
      } else if(selectedValue == 'Last Week') {
        this.calendarVisibility = false;

        this.dateParams.fromdate = new Date(new Date().setDate((currentDate.getDate() - 7)));
        this.dateParams.todate = currentDate;

          setTimeout(()=> {
          this.isdataLoading = false;
          }, 50);
      } else if(selectedValue == 'Pick a Date Range') {

        this.startdate = new Date(new Date().setDate((currentDate.getDate() - 365)));
        this.enddate = currentDate;

        this.dateParams.fromdate = null;
        this.dateParams.todate = null;
        this.calendarVisibility = true;

         setTimeout(()=> {
          this.isdataLoading = false;
         }, 50);
      }

  }

  submitDateRange(){

    this.startdate = this.daterangepickermodel.beginJsDate;
    this.enddate = this.daterangepickermodel.endJsDate;

    if(new Date(this.startdate) <= new Date(this.enddate)) {
    } else {
      this.showNotification('top', 'right', 'From date must be less than To date!!!', 'danger');
        return ;
    }
    this.isdataLoading = true;
    this.dateParams.fromdate = this.startdate;
    this.dateParams.todate =  this.enddate;


     setTimeout(()=> {
      this.isdataLoading = false;
     }, 100);
  }


 ngAfterViewInit(){

}

isMobileMenu() {
  if ($(window).width() > 991) {
      return false;
  }
  return true;
}

showNotification(from :any, align:any, msg:any, type:any) {
    $.notify({
      icon: "notifications",
      message: msg
    }, {
        type: type,
        timer: 3000,
        placement: {
          from: from,
          align: align
        }
      });
  }

}
