
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';

import { OnlyPositiveNumberValidator } from '../../../../shared/components/basicValidators';

import { takeUntil } from 'rxjs/operators';
import { of, Subject } from 'rxjs';
import { CommonService } from '../../../../core/services/common/common.service';
import { BaseLiteComponemntComponent } from '../../../base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import { MatSelectionListChange } from '@angular/material/list';

declare var $: any;

@Component({
  selector: 'app-calendar-configuration',
  templateUrl: './calendar-configuration.component.html',
  styles: [
  ]
})
export class CalendarConfigurationComponent extends BaseLiteComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();

  form: FormGroup;
  submitted: boolean;

  brform: FormGroup;
  brSubmitted: boolean;

  daysList: any[] = [];
  days: any[] = [];
  displayedColumns2: string[];

  disableButton: boolean;
  isLoadingData: boolean = true;

  breakList: any[] = [];
  workingDays: any[] = [];

  userDetails: any = {};

  displayDuration : boolean;

  availibilitydate = new FormControl();
  
  @Input() userid: any;
  @Input() assetid: any;
  @Output() onavailabilityConfigurationData = new EventEmitter();

  constructor(
    private _route: ActivatedRoute,
    private fb: FormBuilder,
    private _commonService: CommonService
  ) {
    super()
    }

  async ngOnInit() {
    try {
      this.form = this.fb.group({
      "days": [this.days, Validators.required],
      "notavailibility": [false],
      "availibilitydate": [],
      "starttime": ['', Validators.required],
      "endtime": ['', Validators.required],
      "duration": [],
    });


    this.brform = this.fb.group({
      'title': ['', Validators.required],
      'days': [''],
      'starttime': ['', Validators.required],
      'endtime': ['', Validators.required]
    });

      super.ngOnInit()
      await this.initializeVariables()
      await this.LoadData();

    this.form.controls['notavailibility']
      .valueChanges
      .subscribe((val)=>{
        this.setAvailibility(val);
        if(val) $("#addavilBtn").click();
      });
    } catch (error) {
      console.log("error", error)
    } finally {
    }
  }

  async initializeVariables() {

    this.displayedColumns2 = [];
    this.displayedColumns2 = ['title', 'starttime', 'endtime', 'action'];

    this.workingDays = this._loginUserBranch.workinghours.days && this._loginUserBranch.workinghours.days.length > 0 ? this._loginUserBranch.workinghours.days : []; 
    this.daysList = [];
    this.daysList.push({ value: "Monday", checked: false , disabled : !this.workingDays.includes("Monday") });
    this.daysList.push({ value: "Tuesday", checked: false , disabled : !this.workingDays.includes("Tuesday")});
    this.daysList.push({ value: "Wednesday", checked: false , disabled : !this.workingDays.includes("Wednesday")});
    this.daysList.push({ value: "Thursday", checked: false , disabled : !this.workingDays.includes("Thursday")});
    this.daysList.push({ value: "Friday", checked: false , disabled : !this.workingDays.includes("Friday")});
    this.daysList.push({ value: "Saturday", checked: false , disabled : !this.workingDays.includes("Saturday")});
    this.daysList.push({ value: "Sunday", checked: false , disabled : !this.workingDays.includes("Sunday")});
    

    this.days = [];


    this.disableButton = false;
    this.isLoadingData = true;

    this.submitted = false;
    this.brSubmitted = false;

    this.breakList = [];

    this.userDetails = {};

    return;
  }

  

  async LoadData() {

    var url = this.userid ? "users/filter" : "assets/filter";
    var method = "POST";

    let postData = {};
    postData['search'] = [];
    postData['search'].push({ "searchfield": 'status', "searchvalue": "active", "criteria": "eq" });
    postData['search'].push({ "searchfield": '_id', "searchvalue": this.userid ? this.userid : this.assetid, "criteria": "eq" });

    await this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {

        if (data && data[0]) {
          
          this.userDetails = data[0];
          if  (this.userDetails && this.userDetails.duration) {
            this.form.controls['duration'].setValue(this.userDetails.duration);
          }
          this.displayDuration = this.assetid != undefined && this.userDetails  && this.userDetails.bookingtype && this.userDetails.bookingtype != 'DAILY';
          let avail = this.userDetails.availability && this.userDetails.availability.notavailibility ? this.userDetails.availability.notavailibility : false;            
          this.form.controls['notavailibility'].setValue(avail);
          
          this.setAvailibility(avail);
          
          if (this.userDetails.breaktime && this.userDetails.breaktime.length > 0) {
            this.userDetails.breaktime.forEach(element => {
              this.breakList.push({ 'title': element.title, 'starttime': element.starttime, 'endtime': element.endtime, 'days': element.days })
            });
            let dataSource = this.breakList;
            let cloned = dataSource.slice();
            this.breakList = cloned;
          }
          setTimeout(() => {
            this.form.controls['availibilitydate'].setValue(this.userDetails?.availability?.availibilitydate);
          });
          
        }
      }, (error) => {
        console.error(error);
      });
  }

  cancelAvail(){
    this.form.get('notavailibility').setValue(false);
    this.setAvailibility(false);
  }

  setAvailibility(notavail : boolean){
    
    // this.form.get('days').enable();
    // this.form.get('starttime').enable();
    // this.form.get('endtime').enable();
    // this.form.get('duration').enable();
   
    this.form.controls['availibilitydate'].setValue(null);
          

    if(this.userDetails.availability && this.userDetails.availability.starttime){
      this.form.controls['starttime'].setValue(this.userDetails.availability.starttime);
     }else{
       this.form.controls['starttime'].setValue(this._loginUserBranch?.workinghours?.starttime);
     }

     if(this.userDetails.availability && this.userDetails.availability.endtime){
       this.form.controls['endtime'].setValue(this.userDetails.availability.endtime);
     }else{
        this.form.controls['endtime'].setValue(this._loginUserBranch?.workinghours?.endtime);
     }
     if (this.userDetails.availability.days && this.userDetails.availability.days.length > 0) {
       this.days = [];
       this.userDetails.availability.days.forEach(days => {
         var fond = this.daysList.find(a => a.value === days);
         fond.checked = false;
         if (fond) {
           fond.checked = true;
           this.days.push(fond.value);
         }
       });
     }else{
       if (this._loginUserBranch.workinghours.days && this._loginUserBranch.workinghours.days.length > 0) {
         this.days = [];
         this._loginUserBranch.workinghours.days.forEach(days => {
           var fond = this.daysList.find(a => a.value === days);
           fond.checked = false;
           if (fond) {
             fond.checked = true;
             this.days.push(fond.value);
           }
         });
       }
     }
     this.form.controls['days'].setValue(this.days);
     
    //  if(notavail){
    //   this.form.get('days').disable();
    //   this.form.get('starttime').disable();
    //   this.form.get('endtime').disable();
    //   this.form.get('duration').disable();
    // }
  }

  updateChecked($event: MatSelectionListChange) {
    
    var daysObj = this.daysList.find(p=>p.value == $event.option.value)
    if ($event.option.selected) {
      this.days.push($event.option.value);
      if(daysObj)
        daysObj.checked = true;
    } else {
      var index = this.days.indexOf($event.option.value);
      this.days.splice(index, 1);
      if(daysObj)
        daysObj.checked = false;
    }
  }

  saveAvail(){
    if(!this.availibilitydate.value){
      this.showNotification('top', 'right', 'Fill required date !!', 'danger');
      return;
    }
    this.form.get('availibilitydate').setValue(this.availibilitydate.value);
    $("#closeavail").click();
  }

  async onSubmit(value: any, isValid: boolean) {
    value = this.form.getRawValue();
    this.submitted = true;
    if (!isValid) {
      this.showNotification('top', 'right', 'Fill required fields !!', 'danger');
      return;
    } else {

      
      // if(this.assetid && this.userDetails && this.userDetails.bookingtype && this.userDetails.bookingtype == 'HOURLY') {
      //   if (value.duration <= 0) {
      //     this.showNotification("top", "right", `Enter valid duration !!`, "danger");
      //     return;
      //   }

      // }

      
      var duration = value.duration;
      if( (this.userid )|| (this.assetid && this.userDetails && this.userDetails.bookingtype && this.userDetails.bookingtype == 'HOURLY')) {

        // if (duration > min) {
        //   super.showNotification("top", "right", "Enter valid duration !!", "danger");
        //   return;
        // }
      }


      let workingstart = this.checkWorkinghrs(this._loginUserBranch.workinghours.starttime);
      let workingend = this.checkWorkinghrs(this._loginUserBranch.workinghours.endtime);
      
      let starttime = this.setTimers(value.starttime);
      let endtime = this.setTimers(value.endtime);
      let cnt = 0;
      if (workingstart.hh > workingend.hh) { // 11:00-08:00
        if ((starttime.hh < workingstart.hh) || (starttime.hh > workingend.hh)) cnt =1;
        else if (starttime.hh == workingstart.hh && starttime.mm >= workingstart.mm) cnt =2;
        else if (endtime.hh == workingend.hh && endtime.mm > workingend.mm) cnt =3;
      } else {                              // 08:00-16:00
        if (starttime.hh > endtime.hh) cnt =4;
        else if (starttime.hh == endtime.hh && starttime.mm >= endtime.mm) cnt =5;
        else if (starttime.hh < workingstart.hh) cnt =6;
        else if (starttime.hh == workingstart.hh && starttime.mm < workingstart.mm) cnt =7;
        else if (endtime.hh > workingend.hh) cnt =8;
        else if (endtime.hh == workingend.hh && endtime.mm > workingend.mm) cnt = 9;
      }
      if (cnt != 0) {
        super.showNotification("top", "right", "Enter valid availibility times !!", "danger");
        return;
      }
  
      this.disableButton = true;
      let postData = {};

      postData["availability"] = {
        days: this.days,
        starttime: value.starttime,
        endtime: value.endtime,
        notavailibility :value.notavailibility,
        availibilitydate :value.availibilitydate,
      };
      postData["duration"] = duration;
      postData["breaktime"] = [];
      postData["breaktime"] = this.breakList;

      var url = this.userid ? "users/" + this.userid : "assets/" + this.assetid;
      var method = "PATCH";

      return this._commonService
        .commonServiceByUrlMethodDataAsync(url, method, postData)
        .then((data: any) => {
          if (data) {
            this.showNotification("top", "right", `Configuration has been updated successfully!!!`, "success");
            this.onavailabilityConfigurationData.emit()
            return;
          }
        }, (error) => {
          console.error(error);
        });
      

    }
  }


  async onSubmitBreak(value: any, valid: boolean) {

    this.brSubmitted = true;

    if (!valid) {
      this.showNotification("top", "right", "Enter required fields !!", "danger");
      return;
    } else { 
      let obj = { title: value.title, starttime: value.starttime, endtime: value.endtime, days: value.days, action: '' };
      let dataSource = this.breakList;
      dataSource.push(obj);
      let cloned = dataSource.slice();
      this.breakList = cloned;
      $("#closebrk").click();
      this.brform.reset();
    }

  }

  addBreak() {
    if(this.days.length > 0) {
      $("#addBreakBtn").click()
    } else {
      this.showNotification('top', 'right', 'Please select Days!!', 'danger');
      return;
    }
  }

  onRemoveBreak(i: number) {
    this.breakList.splice(i, 1);
    let dataSource = this.breakList;
    let cloned = dataSource.slice();
    this.breakList = cloned;
  }


  setdigit(val: number) {
    var ret;
    if (val <= 9) {
      ret = `0${val}`;
    } else {
      ret = `${val}`;
    }
    return ret;
  }

  setTimers(time : string){
    return { hhmm : time , hh :parseInt(time.substring(0,2)) , mm : parseInt(time.substring(3,5)) };
  }

  checkWorkinghrs(time : string){
    return { hhmm : `${time.substring(0,2)}:${time.substring(3,5)}` , hh :parseInt(time.substring(0,2)) , mm : parseInt(time.substring(3,5)) };
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }
}
