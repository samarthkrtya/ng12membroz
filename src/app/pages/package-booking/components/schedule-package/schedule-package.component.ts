import { Component,  OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import {  Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BaseComponemntComponent } from '../../../../shared/base-componemnt/base-componemnt.component';
import * as moment from 'moment';
declare var $: any;

@Component({
  selector: 'app-schedule-package',
  templateUrl: './schedule-package.component.html'
})
export class SchedulePackageComponent extends BaseComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();
  
  form: FormGroup;
  submitted: boolean;
  isLoadingData: boolean;
  disableBtn: boolean;
  isLoadingtab: boolean;
  
  dataContent : any;

  date: Date = new Date();
  mindate: Date = new Date();
  maxdate: Date = new Date();

  recurringoccuranceLists : number[] = [];
  scheduleList: any[] = [];

  upcomingSchedule : any[] = [];
  completedSchedule : any[] = [];

  schldLists = [
    { id: "onetime", name: "One Time", checked: true },
    { id: "recurring", name: "Recurring", checked: false },
    { id: "custom", name: "Custom", checked: false },
  ];

  recurringtypeLists: any[] = [
    { id: "daily", name: "Daily" },
    { id: "weekly", name: "Weekly" },
    { id: "monthly", name: "Monthly" },
  ];

  options = [
    { value: "Monday", checked: false },
    { value: "Tuesday", checked: false },
    { value: "Wednesday", checked: false },
    { value: "Thursday", checked: false },
    { value: "Friday", checked: false },
    { value: "Saturday", checked: false },
    { value: "Sunday", checked: false },
  ];
       
  constructor(
    private _route: ActivatedRoute,
    private fb : FormBuilder,
  ) {
    super(); 
    this._route.params.forEach((params) => {
      this.bindId = params["id"];
    });

    this.mindate = new Date(this.date.getFullYear(),this.date.getMonth(),this.date.getDate());
    this.maxdate = new Date(this.mindate.getFullYear(),this.mindate.getMonth()+2,this.mindate.getDate());

    this.form = this.fb.group({
      'date': [this.mindate, Validators.required],
      'schedule' : ['onetime' , Validators.required],
      'recurringtype': [],
      'recurringoccurance': [2],
      'capacity': [, Validators.required],
      'days': [[]],
      'enddate': [],
    });
  }
 
  async ngOnInit() {
    try {
      this.isLoadingData = true;
      await super.ngOnInit();
      await this.LoadData();
      this.isLoadingData = false;
    } catch (error) {
      this.isLoadingData = false;
      console.error(error);
    }
  }

  async LoadData(){
    await this.getData(this.bindId);

    this.recurringoccuranceLists = [];
    for (var i = 2; i < 52; i++) {
      this.recurringoccuranceLists.push(i);
    }

    this.form.controls['recurringtype']
      .valueChanges
      .subscribe((val)=>{
        if(val){
          this.scheduleList = [];
        }
     });

     this.form.controls['schedule']
     .valueChanges
     .subscribe((val)=>{
       this.onScheduleChanged(val);
     });
    
    this.form.controls['date']
    .valueChanges
    .subscribe((val)=>{
      this.date = new Date(val);
      this.maxdate = new Date(this.date.getFullYear(),this.date.getMonth()+2,this.date.getDate());
      this.form.controls['enddate'].setValue(null);
    });
    return;
  }

  getNextDayOfWeek(date: Date, dayOfWeek: any) {
    var resultDate = new Date(date.getTime());
    resultDate.setDate(date.getDate() + (7 + dayOfWeek - date.getDay() - 1) % 7 + 1);
    return resultDate;
  }
  
  getNextDay(date: Date) {
    var resultDate = new Date(date.getTime());
    resultDate = new Date(resultDate.setDate(resultDate.getDate() + 1));
    return resultDate;
  }

  getNexyDayOfMonth(date: Date) {
    var resultDate = new Date(date.getTime());
    resultDate = new Date(resultDate.setMonth(resultDate.getMonth() + 1));
    return resultDate;
  }

  getDayName(date: Date) {
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var d = new Date(date);
    return days[d.getDay()];
  }

  getDay(date: Date) {
    const d = date.getDate();
    if (d > 3 && d < 21) return 'th';
    switch (d % 10) {
      case 1: return d + "st";
      case 2: return d + "nd";
      case 3: return d + "rd";
      default: return d + "th";
    }
  }
  
  async getData(id : any) {

    let postData = {};
    postData['formname'] = "tourpackage";
    postData["search"] = [];
    postData["search"].push({ "searchfield": "_id", "searchvalue": id, "criteria": "eq", "datatype": "objectId" });
    postData["search"].push({ "searchfield": "status", "searchvalue": "active" , "criteria": "eq", "datatype": "text" });
  
    let url = 'tourpackages/filter/view';
    let method = 'POST';

    await this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
        .then((data: any) => {
          
          this.dataContent = data[0];
          
          this.upcomingSchedule = [];
          this.completedSchedule = [];
          let today = moment(new Date()) ,traveldate;
          
          this.upcomingSchedule = this.dataContent.childpackages.filter(pck=> {
            traveldate = moment(pck.traveldate);
            return traveldate.isAfter(moment(today)); // 14 isAfter 10
          });

          this.completedSchedule = this.dataContent.childpackages.filter(pck=> {
            traveldate = moment(pck.traveldate);
            return traveldate.isBefore(moment(today)); // 5 isBefore 10
          });
        });
  }

  removeDate(date: Date) {
    var holidays = [new Date(date)];
    for (let ind in this.scheduleList) {
      if (holidays.some(d => +d === +this.scheduleList[ind])) {
        this.scheduleList.splice(parseInt(ind), 1);
      }
    }
  }
 
  onScheduleChanged(value) {
      this.scheduleList = [];
      this.disableBtn = false;
      if(value == "custom" || value == "recurring") {
        this.disableBtn = true;
      }
      if (value == "recurring") {
        this.form.get('recurringtype').setValue("daily");
        this.form.get('recurringoccurance').setValue(2);
      }
  }
  
  addtime() {
    if (this.date !== null) {
      this.scheduleList = [];
      var startDate = this.date;
      var endDate = this.form.get('enddate').value;
      let recurringoccurance =  this.form.get('recurringoccurance').value;
      if (this.form.get('schedule').value == "recurring") {
        if (this.form.get('recurringtype').value !== "") {
          if (this.form.get('recurringtype').value == "daily") {
            for (var i = 0; i < recurringoccurance; i++) {
              startDate = this.getNextDay(startDate);
              this.scheduleList.push(startDate);
            }
          } else if (this.form.get('recurringtype').value == "weekly") {
            for (var i = 0; i < recurringoccurance; i++) {
              startDate = this.getNextDayOfWeek(startDate, startDate.getDay())
              this.scheduleList.push(startDate);
            }
          } else if (this.form.get('recurringtype').value == "monthly") {
            for (var i = 0; i < recurringoccurance; i++) {
              startDate = this.getNexyDayOfMonth(startDate);
              this.scheduleList.push(startDate);
            }
          }
          setTimeout(() => {
            if(this.scheduleList.length > 0 ) {
              this.disableBtn = false;
            } else {
              this.showNotification('top', 'right', 'Please select days between specified date range!!', 'danger');
              return;
            }
          }, 100);
        } else {
          this.showNotification('top', 'right', 'Recurring type cannot be empty!!!', 'danger');
          return;
        }
      } else if (this.form.get('schedule').value == "custom") {
        if(endDate == undefined) {
          this.showNotification('top', 'right', 'please select end date!!!', 'danger');
          return;
        }
        if(this.form.get('days').value && this.form.get('days').value.length == 0) {
          this.showNotification('top', 'right', 'please select days!!!', 'danger');
          return;
        }
        if ((endDate <= startDate)) {
          this.showNotification('top', 'right', 'End date should be greater than start date', 'danger');
          return;
        }
        if (this.form.get('days').value && this.form.get('days').value.length !== 0 && endDate !== undefined && endDate !== null) {
          while (startDate <= endDate) {
            var dayOBj = this.form.get('days').value.find(p => p == this.getDayName(startDate));
            if (dayOBj) {
              this.scheduleList.push(new Date(startDate));
            }
            startDate = this.getNextDay(startDate);
          }
          setTimeout(() => {
            if(this.scheduleList.length > 0 ) {
              this.disableBtn = false;
            } else {
              this.showNotification('top', 'right', 'Please select days between specified date range!!', 'danger');
              return;
            }
          }, 100);
          
        } else {
          this.showNotification('top', 'right', 'Validation failed!!', 'danger');
          return;
        }
      }
    } else {
      this.showNotification('top', 'right', 'Start date cannot be empty!!!', 'danger');
      return;
    }
  }

  onSubmit(value: any, valid : boolean){
    this.submitted = true;
    if(!valid){
      this.showNotification('top', 'right', 'Validation Failed !!', 'danger');
      return;
    }
    var url = "tourpackages/";
    var method = "POST";
    var model = this.dataContent;
    model['status'] = "publish";
    model['itemid'] = this.dataContent.itemid && this.dataContent.itemid._id ?  this.dataContent.itemid._id : null;
    model['capacity'] = value.capacity;
    model['schedule'] = value.schedule;
    model['basetourpackage'] = this.bindId;
    
    if(value.schedule == "onetime"){
      model['traveldate'] = value.date._d ? value.date._d : value.date;
    }else{
      model['traveldate'] = this.scheduleList;
    }
    console.log("model",model);

      this.disableBtn = true;
      this.updateparent(value);
      this._commonService
        .commonServiceByUrlMethodDataAsync(url, method, model)
        .then((data: any) => {
          if (data) {
            this.showNotification("top", "right", "Package created successfully !!", "success");
            this._router.navigate([`/pages/package-booking/holiday-package-frontdesk`]);
            this.disableBtn = false;
          }
        }).catch ((e) =>{
          this.disableBtn = false;
          this.showNotification("top", "right", "Something went wrong !!", "danger");
        });
  }

  updateparent(value : any){
    var url = "tourpackages/";
    var method = "PATCH";
    var model = {};
    model['capacity'] = value.capacity;
    model['schedule'] = value.schedule;
    this._commonService.commonServiceByUrlMethodData(url, method, model, this.bindId).pipe(takeUntil(this.destroy$)).subscribe((a)=>{})
  }
  
  subStr(str : string) {
    let s1=  str.substring(0,2);
    let s2=  str.substring(2,4);
    return  `${this.setdigit(parseInt(s1))}:${this.setdigit(parseInt(s2))}`;
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


  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }    
}