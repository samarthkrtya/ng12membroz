import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from "@angular/core";
import { BaseLiteComponemntComponent } from "../../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component";

import { CalendarOptions, DateSelectArg, EventClickArg } from '@fullcalendar/angular';
import { Form, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatCheckboxChange } from "@angular/material/checkbox";

import * as moment from 'moment';
import { CommonService } from "src/app/core/services/common/common.service";
import { takeUntil } from "rxjs/operators";
import { Subject } from "rxjs";

declare var $: any;


@Component({
  selector: "app-appointment-booking",
  templateUrl: "./appointment-booking.component.html",
})
export class AppointmentBookingComponent  extends BaseLiteComponemntComponent implements OnInit , OnDestroy {
  
  form: FormGroup;
  
  @Input('bindId') bindId: any;
  @Input('dataContent') dataContent: any;
  @Input('retrieveData') retrieveData: any;
  
  @Output('onAppointmentData') onAppointmentData = new EventEmitter();
  
  destroy$: Subject<boolean> = new Subject<boolean>();

  alltimeslotLists: any[] = [];
  staffList: any[] = [];
  appointmentscheduleList : any[] = [];
  holidayLists: any[] = [];
  submitted : boolean = false;
  disableBtn: boolean = false;

  recurringtypeLists: any[] = [
    { id: "daily", name: "Daily" },
    { id: "weekly", name: "Weekly" },
    { id: "monthly", name: "Monthly" },
  ];

  stafffields = {
    "fieldname": "staff",
    "fieldtype": "form",
    "fieldfilter": "status",
    "fieldfiltervalue": "active",
    "method": "POST",
    "form": {
      'apiurl' : "users/filter",
      "formfield": "_id",
      "displayvalue": "fullname",
    },
    "formname" : "user",
    "value": "",
    "dbvalue": ""
  };

  recurringoccuranceLists: any[] = [];

  constructor(private fb : FormBuilder ,private _commonService: CommonService){
    super();
    this.form = this.fb.group({
      _id: [],
      date: [new Date(), Validators.compose([Validators.required])],
      timeslot: [null, Validators.compose([Validators.required])],
      staff: [null, Validators.compose([Validators.required])],
      schedule: [null],
      recurringtype: [null],
      recurringoccurance: [null],
      onlinemeet: [null],
      onlinemeeturl: [null],
    });
  }

  async ngOnInit() {
    await super.ngOnInit();
    $("#pblBtn").click();
    if(this.retrieveData){
      this.setData();
    }else{
     this.onDateChanged(this.form.get('date').value);
    }
    this.recurringoccuranceLists = [];
    for (var i = 2; i < 52; i++) {
      this.recurringoccuranceLists.push(i);
    }
  }

  async setData(){
    await this.onDateChanged(this.retrieveData['appointmentdate']);
    this.form.get('date').setValue(this.retrieveData['appointmentdate']);
    this.form.get('_id').setValue(this.retrieveData['_id']);
    this.stafffields.dbvalue = this.retrieveData['host'];
    this.form.get('staff').setValue(this.retrieveData['host']);
    if(this.alltimeslotLists.length  > 0){
      this.form.get('timeslot').setValue(this.alltimeslotLists.find(a=>a.starttime == this.retrieveData.timeslot.starttime && a.endtime == this.retrieveData.timeslot.endtime));
    }
  }
   
  getAllHolidays() {

    var url = "common/viewcalendar/filter"
    var method = "POST";

    let postData = {};
    postData["search"] = [];
    var date : Date = this.form.get('date').value._d ? this.form.get('date').value._d : new Date(this.form.get('date').value);
    postData["search"].push({ "searchfield": "date", "searchvalue": new Date(date.getFullYear(), 0, 1), "criteria": "gte", "datatype": "Date", "cond": "and" });
    postData["search"].push({ "searchfield": "date", "searchvalue": new Date(date.getFullYear() + 1, 0, 1), "criteria": "lte", "datatype": "Date", "cond": "and" });
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq", "datatype": "text" });
    postData["search"].push({ "searchfield": "type", "searchvalue": "holiday", "criteria": "eq", "datatype": "text" });

     this._commonService
      .commonServiceByUrlMethodData(url, method, postData)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        if (data) {
          this.holidayLists = [];
          this.holidayLists = data;
        }
      }, (error) => {
        console.error(error);
      });
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

  getNextDayOfWeek(date: Date, dayOfWeek: any) {
    var resultDate = new Date(date.getTime());
    resultDate.setDate(date.getDate() + (7 + dayOfWeek - date.getDay() - 1) % 7 + 1);
    return resultDate;
  }

  getDay(date: any) {
    const d = date._i.date; 
    if (d > 3 && d < 21) return d + 'th';
    switch (d % 10) {
      case 1: return d + "st";
      case 2: return d + "nd";
      case 3: return d + "rd";
      default: return d + "th";
    }
  }

  getTimeSlot(timeslot){
    return timeslot.displaytext;
  }

  getDayName(date: Date) {
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var d = new Date(date);
    return days[d.getDay()];
  }

  onScheduleChanged(event: MatCheckboxChange): void {
    if(event.checked) {
      this.form.get('recurringtype').setValue("daily");
      this.form.get('recurringoccurance').setValue(2);
    } else {
      this.form.get('recurringtype').setValue("");
      this.form.get('recurringoccurance').setValue(0);
    }
  }

  addtime() {
    if (this.form.get('date').value !== null) {
      this.appointmentscheduleList = [];
      var startDate = new Date(this.form.get('date').value);
      if (this.form.get('schedule').value == true) {
        if (this.form.get('recurringtype').value !== "") {
          this.appointmentscheduleList.push(startDate);
          if (this.form.get('recurringtype').value == "daily") {
            for (var i = 0; i < this.form.get('recurringoccurance').value - 1; i++) {
              startDate = this.getNextDay(startDate);
              this.appointmentscheduleList.push(startDate);
            }
          } else if (this.form.get('recurringtype').value == "weekly") {
            for (var i = 0; i < this.form.get('recurringoccurance').value - 1; i++) {
              startDate = this.getNextDayOfWeek(startDate, startDate.getDay())
              this.appointmentscheduleList.push(startDate);
            }
          } else if (this.form.get('recurringtype').value == "monthly") {
            for (var i = 0; i < this.form.get('recurringoccurance').value - 1; i++) {
              startDate = this.getNexyDayOfMonth(startDate);
              this.appointmentscheduleList.push(startDate);
            }
          }
        } else {
          this.showNotification('top', 'right', 'Recurring type cannot be empty!!!', 'danger');
          return;
        }
      }
    } else {
      this.showNotification('top', 'right', 'Date cannot be empty!!!', 'danger');
      return;
    }
  }

  removeDate(date: Date) {
    var holidays = [new Date(date)];
    for (let i in this.appointmentscheduleList) {
      if (holidays.some(d => +d === + this.appointmentscheduleList[i])) {
        this.appointmentscheduleList.splice(parseInt(i), 1);
      }
    }
  } 

  showOptions(event: MatCheckboxChange): void {
    if(event.checked) {
      this.form.get('onlinemeeturl').setValidators([Validators.required]); 
    } else {
      this.form.get('onlinemeeturl').clearValidators();
    }
    this.form.get('onlinemeeturl').updateValueAndValidity()
  }

  onCancel(){
    this.onAppointmentData.emit("success");
    $("#close_pbls").click();
  }

 async updateService(value){

    var url = "appointments";
    var method = "PUT";
      
    let model = {};
    model = value;
    model['onModel'] = "Groupclass";
    model['attendee'] = "61724b90f006d9191c796b73";
    model['appointmentdate'] = value.date;
    
    var timeslot = {
      "day" : value.timeslot.day, 
      "starttime" : value.timeslot.starttime, 
      "endtime" : value.timeslot.endtime,
    };
    var property = {};
    if(value['onlinemeet'] == true) {
        property['onlinemeet'] = true;
        property['onlinemeeturl'] = value['onlinemeeturl'];
    }

    model['date'] = value.date,
    model['eventid'] = this.bindId,
    model['timeslot'] = timeslot,
    model['host'] = this.form.get('staff').value._id ? this.form.get('staff').value._id : this.form.get('staff').value,
    model['charges']=0,
    model['duration']= this.dataContent['property']['sessionduration'],
    model['property'] = property
    model['status'] = "requested";

    this.disableBtn = true;
    // console.log("model",model);
    await this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, model, value._id)
      .then((data: any) => {
        if (data) {
          $("#close_pbls").click();
          this.disableBtn = false;
          super.showNotification('top', 'right', 'Services has been updated Successfully !!', 'success');
          setTimeout(() => {
            this.onAppointmentData.emit("success");
          }, 200);
        }
      });
  }
  
  async onSave(value : any, valid : boolean){
    if(!valid){
      this.showNotification('top', 'right', 'Fill required fields !!', 'danger');
      return;
    }
    this.submitted = true;

    if(value._id){
      this.updateService(value);
    }else{
 
    var services = [];

      var timeslot = {
        "day" : value.timeslot.day, 
        "starttime" : value.timeslot.starttime, 
        "endtime" : value.timeslot.endtime,
      };

      var property = {};
      if(this.form.get('onlinemeet').value == true) {
          property['onlinemeet'] = true;
          property['onlinemeeturl'] = this.form.get('onlinemeeturl').value;
      }

      if(this.form.get('schedule').value == true) {
          if(this.appointmentscheduleList.length > 0) {
            this.appointmentscheduleList.forEach(elementDate => {
              let obj = {
                date: new Date(elementDate),
                eventid : this.bindId,
                timeslot: timeslot,
                host: this.form.get('staff').value._id ? this.form.get('staff').value._id : this.form.get('staff').value,
                charges:0,
                duration: this.dataContent['property']['sessionduration'],
                property: property
              }
              services.push(obj);
            });
          }
        } else {
          let obj = {
            date: value.date,
            eventid : this.bindId,
            timeslot: timeslot,
            host: this.form.get('staff').value._id ? this.form.get('staff').value._id : this.form.get('staff').value,
            charges:0,
            duration: this.dataContent['property']['sessionduration'],
            property: property
          }
          services.push(obj);
        }
 
      var url = "/appointments/multi";
      var method = "POST";
      
      let postData = {};
      postData['services'] = services;

      
      postData['onModel'] = "Groupclass";
      postData['attendee'] = "61724b90f006d9191c796b73";

      this.disableBtn = true;
      
      this.updateStatus();
      try{
        await this._commonService
        .commonServiceByUrlMethodDataAsync(url, method, postData)
        .then((data: any) => {
          if (data) {
            
            $("#close_pbls").click();
            this.disableBtn = false;
            super.showNotification('top', 'right', 'Services has been added Successfully !!', 'success');
            setTimeout(() => {
              this.onAppointmentData.emit("success");  
            }, 200);
          }
        });
      }catch(e){
        super.showNotification('top', 'right', 'Something went wrong !!', 'danger');
        this.disableBtn = false;
        setTimeout(() => {
          this.onAppointmentData.emit("failure");  
        }, 200);
      }
    }
  }

  updateStatus(){
    let postData = {
      "schemaname": 'events',
      "ids": [this.bindId],
      "value": 'publish'
    };
  this._commonService
      .updatestatus(postData)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
      });
  }

 async onDateChanged(val: any) {
    // console.log("onDateChanged==>",val);
    if (val) {
      var date : Date  =  val._d ? val._d : new Date(val);
      
      var istoday: boolean = false;
      var today = new Date();
      this.alltimeslotLists = [];
      
      var starttime =  this.workingDetails['starttime'];
      var endtime = this.workingDetails['endtime'];
      var duration = this.dataContent['property']['sessionduration'];
   
      var endmin = endtime.split(":");
      var endtimehr = parseInt(endmin[0]);
      var endtimemin = parseInt(endmin[1]);
      var totalendmin = endtimehr * 60 + endtimemin;

      var startmin = starttime.split(":");
      var timehr = parseInt(startmin[0]);
      var timemin = parseInt(startmin[1]);
      var totalstartmin = timehr * 60 + timemin;

      var currenthr = today.getHours();
      var currentmin = today.getMinutes();
      var currenthrmin = currenthr * 60 + currentmin;

      var selectedDay = this.getDayName(date);
      if (today.getFullYear() == date.getFullYear() && today.getMonth() == date.getMonth() && today.getDate() == date.getDate()) {
        istoday = true;  // then do operation
      }

      for (var time = totalstartmin; time < totalendmin;) {
        timemin = Number(timemin);
        var start;
        if (timemin <= 9) {
          start = timehr + ":" + "0" + timemin;
        } else {
          start = timehr + ":" + timemin;
        }
        var end;
        if (duration <= 60) {
          timemin += parseInt(duration);
          if (timemin >= 60) {
            timehr += 1;
            timemin -= 60;
          }
          if (timemin <= 9) {
            end = timehr + ":" + "0" + timemin;
          } else {
            end = timehr + ":" + timemin;
          }
        } else {
          end = moment(timehr + ':' + timemin, 'HH:mm');
          end.add(duration, 'm');
          end = end.format("HH:mm");
          var tempstartmin = end.split(":");
          timehr = parseInt(tempstartmin[0]);
          timemin = parseInt(tempstartmin[1]);
        }
        var disabled: boolean = false;
        if (istoday && time < currenthrmin) {
          disabled = true;
        }

        var obj = {
          "starttime": start,
          "endtime": end,
          "day": selectedDay,
          "displaytext": start + " - " + end,
          "disabled": disabled,
        }
        this.alltimeslotLists.push(obj);
        time += parseInt(duration);
      }
      this.getAllHolidays();
      return;
    }
  }

  myFilter = (d: Date): boolean => {
    
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var dayName = days[new Date(d).getDay()];

    return  this.isInArray(this.holidayLists, d) && this.workingDetails['days'].includes(dayName);
  }

  
  isInArray(array: any, value: Date) {
    var check = array.find(item=> new Date(item.date).toDateString() == new Date(value).toDateString())
    if(check) {
      return false
    } else {
      return true
    }
  }


  isHoliday(date: any) {
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var dayName = days[new Date(date).getDay()];
    var working = this.workingDetails['days'].includes(dayName);
    if(!working) {
      return false;
    } else {
      var check = this.holidayLists.find(item=> new Date(item.date).toDateString() == new Date(date).toDateString())
      if(check) {
        return false
      } else {
        return true
      }
    }
  }


  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
}

}

