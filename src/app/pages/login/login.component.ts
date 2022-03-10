import { Component, OnInit, ElementRef } from '@angular/core';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';

import { Title } from '@angular/platform-browser';


import { UserLoginModel } from '../../core/models/userlogin/userlogin.model';
import { UserloginService } from './../../core/services/userlogin/userlogin.service';

import { CompanySettingService } from '../../core/services/admin/company-setting.service';
import { BaseLiteComponemntComponent } from 'src/app/shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from 'src/app/core/services/common/common.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

declare var $: any;

@Component({
   selector: 'app-login-cmp',
   templateUrl: './login.component.html'
})

export class LoginComponent extends BaseLiteComponemntComponent implements OnInit {

   destroy$: Subject<boolean> = new Subject<boolean>();

   public form: FormGroup;

   resetType: string = 'user';

   submitted: boolean = false;
   public _UserLoginModel = new UserLoginModel();
   public token: any;
   public Invalid = false;
   disableBtn: boolean = false;

   memberFormDisplayFormName: string;
   userFormDisplayFormName: string;

   logoPath: any;
   loginbgPath: any;
   allowmemberlogin = true;
   footerimgPath: any;
   isLoadimg = false;
   ismemberlogin = true;
   isLoadbackimg = false;
   isLoading = false;
   currency: any;
   mobileToken: any;
   language: any;
   userLanguage: any;
   cloud_name: any;

   supportedlanguageLists: any[] = [];

   rtl: boolean;

   loginheader: string = 'Powerful Solutions for your business';
   loginsubheader: string = 'A Complete SaaS Solution Tailored to Your Business Need';
   copyright: string = 'Membroz';

   memberportal: any;
   adminloginimage: any;
   isXeroConnected: any;

   constructor(
      private _route: ActivatedRoute,
      private fb: FormBuilder,
      private titleService: Title,
      private _commonService: CommonService,
      private companySettingService: CompanySettingService,

   ) {
      super();
      this.rtl = false;
      this.userLanguage = 'en';

      this._route.params.forEach((params) => {
         if (params["type"]) {
            this.resetType = params["type"];
         }
      });

      this._authService.logout();
      this.form = this.fb.group({
         'email': ['', Validators.compose([Validators.required, Validators.minLength(4)])],
         'password': ['', Validators.compose([Validators.required, Validators.minLength(4)])],
      });

   }

   async ngOnInit() {
      await super.ngOnInit();
      this.getipath();
      this.getDisplayDetails();
   }

   getipath() {
      this.isLoadimg = true;
      this.isLoadbackimg = true;
      this.companySettingService
         .GetAll()
         .pipe(takeUntil(this.destroy$))
         .subscribe(data => {
            if (data) {
               if (data[0]['logo']) {
                  this.logoPath = data[0]['logo'];
                  this.isLoadimg = false;
               } else {
                  this.isLoadimg = false;
               }

               if (data[0]['allowmemberlogin'] != undefined && !data[0]['allowmemberlogin']) {
                this.allowmemberlogin = false
              } else {
                  this.titleService.setTitle('Web Portal');
              }
               if (data[0]['webtitle'] != undefined) {
                  this.titleService.setTitle(data[0]['webtitle']);
               } else {
                  this.titleService.setTitle('Web Portal');
               }

               if (data[0] && data[0]['footerimage']) {
                  this.footerimgPath = data[0]['footerimage'];

                  this.isLoadbackimg = false;
               } else {
                  this.isLoadbackimg = false;
               }

               if (data[0] && data[0]['ismemberlogin'] == false) {
                  this.ismemberlogin = false;
               } else if (data[0] && data[0]['ismemberlogin'] == true) {
                  this.ismemberlogin = true;
               }

               if (data[0] && data[0]['language']) {
                  this.language = data[0]['language'];
               }

               if (data[0] && data[0]['supportedlanguage']) {
                  this.supportedlanguageLists = data[0]['supportedlanguage'];
                  if (this.supportedlanguageLists.length == 0) {
                     this.supportedlanguageLists = [{
                        "id": "en",
                        "itemName": "English"
                     }]
                  }
               }

               if (data[0] && data[0]['cloud_name']) {
                  this.cloud_name = data[0]['cloud_name'];
               }

               if (data[0] && data[0]['loginheader']) {
                  this.loginheader = data[0]['loginheader'];
               }

               if (data[0] && data[0]['loginsubheader']) {
                  this.loginsubheader = data[0]['loginsubheader'];
               }
               if (data[0] && data[0]['copyright']) {
                  this.copyright = data[0]['copyright'];
               }

               if (data[0] != undefined && data[0].memberportal != undefined) {
                  this.memberportal = data[0].memberportal;
               }

               if (data[0] != undefined && data[0].adminloginimage != undefined) {
                  this.adminloginimage = data[0].adminloginimage;
               }

            } else {
               this.isLoadimg = false;
               this.isLoadbackimg = false;
            }
         }, data => {
            this.isLoadimg = false;
            this.isLoadbackimg = false;
         });
   }

   getDisplayDetails() {

      var url = 'forms/filter';

      let postData = {};
      postData["search"] = [];
      postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq", "datatype": "text" });
      postData["search"].push({ "searchfield": "formname", "searchvalue": ["member", "user"], "criteria": "in", "datatype": "text" });

      this._commonService
         .commonServiceByUrlMethodData(url, "POST", postData)
         .pipe(takeUntil(this.destroy$))
         .subscribe((data: any[]) => {
            if (data.length > 0) {
               var member,user;
               member = data.find(a => a.formname == 'member');
               user = data.find(a => a.formname == 'user');
               this.memberFormDisplayFormName = member && member['dispalyformname'] ? member['dispalyformname'] : '';
               this.userFormDisplayFormName = user && user['dispalyformname'] ? user['dispalyformname'] : '';
            }
         });
   }


   onSubmit(values: any, isValid: boolean) {
      this.isLoading = true;
      this.submitted = true;
      if (!isValid) {
         return false;
      } else {
         this.disableBtn = true;
         this._UserLoginModel.username = values.email;
         this._UserLoginModel.password = values.password;

         this.mobileToken = '';
         this.mobileToken = this.readCookie('FCM_Token');
         if (this.mobileToken && this.mobileToken !== '') {
            var mobileInfo = this.mobileToken.split('::');
            var RegistrationID = mobileInfo[0];
            var DeviceType = mobileInfo[1];
            var DeviceID = mobileInfo[2];

            this._UserLoginModel.deviceid = DeviceID;
            this._UserLoginModel.devicetype = DeviceType;
            this._UserLoginModel.registrationid = RegistrationID;
         }
         var url;
         if (this.resetType == 'user') {
            url = 'auth/login';
         } else {
            url = 'auth/memberlogin';
         }

         this._commonService
            .commonServiceByUrlMethodData(url, "POST", this._UserLoginModel)
            .pipe(takeUntil(this.destroy$))
            .subscribe((data: any) => {
               console.log("data==>",data);
               if (data) {
                  if (data.type != undefined && data.type == 'Error') {
                     this.isLoading = false;
                     this.Invalid = true;
                     this._authService.logout();
                     if (data.message != undefined) {
                        this.showNotification('top', 'right', data.message, 'danger');
                     } else {
                        this.showNotification('top', 'right', 'No such user exist', 'danger');
                     }
                     return;
                  }else if(data.Error && data.Error == 403){
                     this.isLoading = false;
                     this.disableBtn = false;
                     this._authService.logout();
                     this.showNotification('top', 'right', data.message, 'danger');
                     return;                     
                  }
                  this.Invalid = false;

                  if (this.userLanguage != undefined) {
                     this.language = this.userLanguage;

                     this.supportedlanguageLists.forEach(element => {
                        if (element.id == this.userLanguage && element.rtl) {
                           this.rtl = true;
                        }
                     });
                  }

                  data.user.password = '';
                  this.token = {
                     username: data.username,
                     user: data.user,
                     token: data.token,
                     role: data.user.role,
                     roletype: data.user.role.roletype,
                     _id: data.user._id,
                     rtl: this.rtl,
                     language: this.language,
                     // currency: data.currency,
                     currency: (data.user != undefined && data.user.branchid != undefined && data.user.branchid.currency != undefined) ? data.user.branchid.currency : 'INR',
                     organizationsetting: data.organizationsetting,
                     cloud_name: this.cloud_name
                  };

                  localStorage.setItem('xeroAuth', (data.xero && data.xero.isConnected)? 'true' : 'false'); 
                  localStorage.setItem('xeroPaymentCalendar', (data.xero && data.xero.payrollCalendarId)? data.xero.payrollCalendarId : 'undefined'); 

                  this._authService.login(this.token);
                  // this.form.reset();
                  this.submitted = false;

                  if (this.rtl) {
                     $("html").attr("dir", "rtl");
                  } else {
                     $("html").attr("dir", "");
                  }
                  this.isLoading = false;
                  // this._router.navigate(['pages/dashboard'])
                  this._router.navigate(['pages/dynamic-dashboard']);
                  this.disableBtn = false;
               }
            },
               data => {
                  if (data) {
                     this.isLoading = false;
                     this.Invalid = true;
                     this._authService.logout();
                     this.disableBtn = false;
                  }
               });
      }

   }

   readCookie(name: string) {
      var nameEQ = name + '=';
      var ca = document.cookie.split(';');
      for (var i = 0; i < ca.length; i++) {
         var c = ca[i];
         while (c.charAt(0) == ' ') c = c.substring(1, c.length);
         if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
      }
      return null;
   }

   showNotification(from: any, align: any, msg: any, type: any) {
      $.notify({
         icon: 'notifications',
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

   correctUrl(url: any) {
      url = url.replace(/(^\w+:|^)\/\//, '');
      if (url.substring(url.length - 1) == "/") {
         url = url.substring(0, url.length - 1);
      }
      return url;
   }

   styleObject(): Object {
      if (this.adminloginimage && this.adminloginimage !== "") {
         return { 'background-image': `url(${this.adminloginimage})`, 'background-size': 'cover', 'background-position': 'top center' }
      }
      return {}
   }

   ngOnDestroy() {
      this.destroy$.next(true);
      this.destroy$.unsubscribe();
    }
}
