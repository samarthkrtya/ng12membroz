import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { interval, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UserLoginModel } from 'src/app/core/models/userlogin/userlogin.model';
import { CompanySettingService } from 'src/app/core/services/admin/company-setting.service';
import { CommonService } from 'src/app/core/services/common/common.service';
import { BaseLiteComponemntComponent } from 'src/app/shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
export interface Entry {
   created: Date;
}
export interface TimeSpan {
   hours: number;
   minutes: number;
   seconds: number;
}

declare var $: any;
@Component({
   selector: 'app-user-checkin',
   templateUrl: './user-checkin.component.html'
})

export class UserCheckinComponent extends BaseLiteComponemntComponent implements OnInit {

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
   // loginbgPath: any;
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

   memberportal: any;
   adminloginimage: any;

   entries: Entry[]
   attendanceId: any;
   checkIn: boolean = false;
   checkInData: any;
   checkInDateTime: Date
   checkInDate: any;
   checkInTime: any;
   hours = 0;
   minutes = 0;
   seconds = 0;

   currentLatitude: any;
   currentLongitude: any;

   constructor(private _route: ActivatedRoute,
      private fb: FormBuilder,
      private titleService: Title,
      private _commonService: CommonService,
      private companySettingService: CompanySettingService,
      private datePipe: DatePipe,
      private changeDetector: ChangeDetectorRef) {
      super();
      this.rtl = false;
      this.userLanguage = 'en';

      this._route.params.forEach((params) => {
         if (params["type"]) {
            this.resetType = params["type"];
         }
      });
      //this._authService.logout();
      this.form = this.fb.group({
         'email': ['', Validators.compose([Validators.required, Validators.minLength(4)])],
         'password': ['', Validators.compose([Validators.required, Validators.minLength(4)])],
      });
   }

   async ngOnInit() {
      await super.ngOnInit();
      this.getipath();
      this.getDisplayDetails();
      this.getCheckinData();
      this.getLocation()
   }

   getLocation() {

      var th = this;

      navigator.geolocation.getCurrentPosition(function(){
         th.disableBtn = false;
         console.log('Location accessed')
      },function() {
         th.disableBtn = true;
         console.log('User not allowed')
      })

      if (navigator.geolocation) {
         navigator.geolocation.getCurrentPosition(position => {
            this.currentLatitude = position.coords.latitude;
            this.currentLongitude = position.coords.longitude;
         });
      } else {
        console.log("Geolocation is not supported by this browser.")
      }
   }



   arePointsNear(checkPoint: any, centerPoint: any, km: any) {

      console.log("checkPoint", checkPoint);
      console.log("centerPoint", centerPoint);
      console.log("km", km);

      var ky = 40000 / 360;
      var kx = Math.cos(Math.PI * centerPoint.lat / 180.0) * ky;
      var dx = Math.abs(centerPoint.lng - checkPoint.lng) * kx;
      var dy = Math.abs(centerPoint.lat - checkPoint.lat) * ky;
      return Math.sqrt(dx * dx + dy * dy) <= km;
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
                     }, {
                        "id": "es",
                        "itemName": "Spanish"
                     }]
                  }
               }

               if (data[0] && data[0]['cloud_name']) {
                  this.cloud_name = data[0]['cloud_name'];
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
               this.memberFormDisplayFormName = data.find(a => a.formname == 'member')['dispalyformname'];
               this.userFormDisplayFormName = data.find(a => a.formname == 'user')['dispalyformname'];
            }
         });
   }

   getElapsedTime(entry: Entry): TimeSpan {

      let totalSeconds = Math.floor((new Date().getTime() - entry.created.getTime()) / 1000);
      if (totalSeconds >= 3600) {
         this.hours = Math.floor(totalSeconds / 3600);
         totalSeconds -= 3600 * this.hours;
      }
      if (totalSeconds >= 60) {
         this.minutes = Math.floor(totalSeconds / 60);
         totalSeconds -= 60 * this.minutes;
      }
      this.seconds = totalSeconds;
      return {
         hours: this.hours,
         minutes: this.minutes,
         seconds: this.seconds
      };
   }

   async onSubmit(values: any, isValid: boolean) {
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
               if (data) {
                  if (data.type != undefined && data.type == 'Error') {
                     this.isLoading = false;
                     this.Invalid = true;
                     //this._authService.logout();
                     if (data.message != undefined) {
                        this.showNotification('top', 'right', data.message, 'danger');
                     } else {
                        this.showNotification('top', 'right', 'No such user exist', 'danger');
                     }
                     return;
                  }


                  if(data && data.user && data.user.branchid && data.user.branchid.property && data.user.branchid.property.locationlogin) {

                     console.log("Latitude", this.currentLatitude)
                     console.log("Longitude", this.currentLongitude)

                     var vasteras = { lat: this.currentLatitude, lng: this.currentLongitude };
                     var stockholm = { lat: data.user.branchid.property.locationlogin.latitude, lng: data.user.branchid.property.locationlogin.longitude };

                     var n = this.arePointsNear(vasteras, stockholm, data.user.branchid.property.locationlogin.km);
                     console.log("n", n);
                     if(!n) {
                        this.isLoading = false;
                        //this.Invalid = true;
                        this.showNotification('top', 'right', 'You are not allow to checkin remotely. Please contact support.', 'danger');
                        return;
                     }
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
                  this._authService.login(this.token);
                  // this.form.reset();
                  this.submitted = false;

                  this.onCheckIn(this.token._id);

                  if (this.rtl) {
                     $("html").attr("dir", "rtl");
                  } else {
                     $("html").attr("dir", "");
                  }
                  this.isLoading = false;
                  // this._router.navigate(['pages/dashboard'])
                  // this._router.navigate(['pages/dynamic-dashboard']);
                  this.disableBtn = false;
               }
            },
            data => {
               if (data) {
                  this.isLoading = false;
                  this.Invalid = true;
                  //this._authService.logout();
                  this.disableBtn = false;
               }
         });
      }
   }

   onCheckIn(id) {

      this.checkIn = true



      let checkinDateTime = new Date()
      let checkinData = {
         userid: id,
         checkin: checkinDateTime
      }

      localStorage.setItem('checkin', JSON.stringify(checkinData))

      let checkin = localStorage.getItem('checkin')

      let startDateTime = new Date(new Date().getFullYear(),new Date().getMonth(),new Date().getDate(),0,0,0)
      let endDateTime = new Date(new Date().getFullYear(),new Date().getMonth(),new Date().getDate(),23,59,59)

      let postData = {};
      postData["search"] = [];
      postData["search"].push({ "searchfield": "checkin", "searchvalue": startDateTime, "criteria": "gte", "datatype": "Date", "cond": "and" },
          { "searchfield": "checkin", "searchvalue": endDateTime, "criteria": "lte", "datatype": "Date", "cond": "and" });

      var url = "attendances/filter"
      var method = "POST"


      this._commonService.commonServiceByUrlMethodData(url, method, postData)
      .subscribe((data: any) => {
         if(data[0]){
            this.attendanceId= data[0]._id

            if(data[0].checkin<= checkin){
               this.checkInDateTime = data[0].checkin
               this.checkInDate = this.datePipe.transform(this.checkInDateTime, 'dd/MM/yyyy')
               this.checkInTime = new Date(this.checkInDateTime).getHours() + " : " + new Date(this.checkInDateTime).getMinutes() + " : " + new Date(this.checkInDateTime).getSeconds();
               this.entries = [
                  { created: new Date(new Date(this.checkInDateTime).getTime()) }
               ];
               interval(1000).subscribe(() => {
                  if (!this.changeDetector['destroyed']) {
                     this.changeDetector.detectChanges();
                  }
               });
            }
         }
         else{
            this.checkInDateTime = new Date()
            this.checkInDate = this.datePipe.transform(this.checkInDateTime, 'dd/MM/yyyy')
            this.checkInTime = new Date(this.checkInDateTime).getHours() + " : " + new Date(this.checkInDateTime).getMinutes() + " : " + new Date(this.checkInDateTime).getSeconds();
            this.entries = [
               { created: new Date(new Date().getTime()) }
            ];
            interval(1000).subscribe(() => {
               if (!this.changeDetector['destroyed']) {
                  this.changeDetector.detectChanges();
               }
            });
            let attendancecheckinObj = {
               membrozid: id,
               checkin: this.checkInDateTime,
               checkout: this.checkInDateTime,
               onModel: "User"
            }

            var url = "attendances"
            this._commonService.commonServiceByUrlMethodData(url, method, attendancecheckinObj)
            .subscribe((data: any) => {

               this.changeDetector.detectChanges();
               if (data) {
                  this.attendanceId = data._id
                  this.showNotification('top', 'right', 'Check in done successfully!!', 'success');
               }
            })
         }
      })
   }

   getCheckinData() {
      let checkinData = JSON.parse(localStorage.getItem('checkin'))

      if(checkinData!=null){
         let checkinDate: Date = new Date(checkinData.checkin)
         let startDateTime : Date = new Date(new Date().getFullYear(),new Date().getMonth(),new Date().getDate(),0,0,0)

         if(checkinDate <= startDateTime){
          localStorage.removeItem('checkin')
         }
      }
      this.checkInData = JSON.parse(localStorage.getItem('checkin'));
      if (this.checkInData) {


         this.checkInDate = this.datePipe.transform(this.checkInData.checkin, 'dd/MM/yyyy')
         this.checkInTime = new Date(this.checkInData.checkin).getHours() + " : " + new Date(this.checkInData.checkin).getMinutes() + " : " + new Date(this.checkInData.checkin).getSeconds();
         this.checkInDateTime = this.checkInData.checkin
         this.entries = [
            { created: new Date(new Date(this.checkInDateTime).getTime()) }
         ];
         interval(1000).subscribe(() => {
            if (!this.changeDetector['destroyed']) {
               this.changeDetector.detectChanges();
            }
         });
         this.changeDetector.detectChanges();
      }
   }

   onCheckOut() {

      let attendanceObj = {
         checkin: this.checkInDateTime,
         checkout: new Date(),
      }

      var url = "attendances/" + this.attendanceId
      var method = "PATCH"

      this._commonService.commonServiceByUrlMethodData(url, method, attendanceObj)
         .subscribe(data => {
            if (data) {
               this.showNotification('top', 'right', 'Check out done successfully!!', 'success');
               localStorage.removeItem('checkin')
               location.reload()
            }
         })
   }

   ngAfterViewChecked() {


      this.changeDetector.detectChanges();
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
