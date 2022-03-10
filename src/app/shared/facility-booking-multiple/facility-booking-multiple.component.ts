import { Component, OnInit, Input, Output, EventEmitter, ViewChildren, QueryList } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';

import { takeUntil } from 'rxjs/operators';
import { of, Subject } from 'rxjs';
import { CommonService } from '../../core/services/common/common.service';
import { BaseLiteComponemntComponent } from '../base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import * as moment from 'moment';

import { MatRadioChange } from '@angular/material/radio';
import { MatSelectionListChange } from '@angular/material/list';

import {MatExpansionPanel} from '@angular/material/expansion';

import { AppointmentModel } from '../../core/models/appointment/appointment.model';

import swal from 'sweetalert2';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';

declare var $: any;

export const _filter = (opt: any[], value: any): any[] => {
  const filterValue = value.toLowerCase();
  return opt.filter(item => item.title.toLowerCase().includes(filterValue));
};

@Component({
  selector: 'app-facility-booking-multiple',
  templateUrl: './facility-booking-multiple.component.html',
  styles: [

    `
    ::ng-deep .mat-select-panel .mat-pseudo-checkbox {
      border: 2px solid !important
    }
    
    ::ng-deep dynamic-autocomplete mat-form-field.mat-form-field.example-full-width{
      margin-bottom: -1.00em !important;
    }

    .font-size-75 {
      font-size: 75% !important;
    }


    .example-action-buttons {
      padding-bottom: 20px;
    }

    .example-headers-align .mat-expansion-panel-header-title,
    .example-headers-align .mat-expansion-panel-header-description {
      flex-basis: 0;
    }

    .example-headers-align .mat-expansion-panel-header-description {
      justify-content: space-between;
      align-items: center;
    }

    .example-headers-align .mat-form-field + .mat-form-field {
      margin-left: 8px;
    }

    .example-form {
      min-width: 150px;
      max-width: 500px;
      width: 100%;
    }

    .example-full-width {
      width: 100%;
    }

    .example-option-img {
      vertical-align: middle;
      margin-right: 8px;
    }

    [dir='rtl'] .example-option-img {
      margin-right: 0;
      margin-left: 8px;
    }

    .nonworking {
      border: 1px solid red;
    }
  
  `

  ]
})
export class FacilityBookingMultipleComponent extends BaseLiteComponemntComponent implements OnInit {

  @ViewChildren(MatExpansionPanel) pannels:QueryList<MatExpansionPanel> 

  destroy$: Subject<boolean> = new Subject<boolean>();

  form: FormGroup;
  submitted: boolean;
  disableBtn: boolean = false;

  _appointmentModel = new AppointmentModel();

  _id: any;
  date: Date;
  assign: any;
  
  @Input() dataContent: any;
  @Input() type: any;
  @Input() passondate: Date;
  @Output() onBookingData = new EventEmitter();

  attendee = new FormControl();
  attendeeoptions: string[] = [];
  filteredAttendeeOptions: Observable<string[]>;
  allAttendeeLists: any[] = [];
  attendeeisLoadingBox: boolean = false;


  service = new FormControl();
  serviceLists: any [] = [];
  filteredServices: Observable<any[]>;
  allServiceLists: any [] = [];
  allPackageLists: any [] = [];
  serviceisLoadingBox: boolean = false;

  assignLists: any[] = [
    { id: "individual", name: "Individual", checked: true },
    { id: "group", name: "Group", checked: false }
  ];

  recurringtypeLists: any[] = [
    { id: "daily", name: "Daily" },
    { id: "weekly", name: "Weekly" },
    { id: "monthly", name: "Monthly" },
  ];

  recurringoccuranceLists: any[] = [];

  step = 0;

  holidayLists: any [] = [];
  workinghours: any = {};

  constructor(
    private _commonService: CommonService,
    private fb: FormBuilder,
    private _route: ActivatedRoute,
  ) { 

    super()

    this.pagename = "app-facility-booking-multiple";

    this.form = fb.group({
      '_id': [this._id],
      'attendee': [this.attendee, { validators: [] }],
      'assign': [this.assign],
      'service': [this.service, { validators: [Validators.required] }]
    });
  }

  async ngOnInit() {

    try {
      super.ngOnInit()
      await this.initializeVariables()
      await this.getServiceLists()
      await this.getpackageLists()
      await this.getAllHolidays()

      if (this.type == "multi") {
        await this.getAllContacts()
      }
      
    } catch (error) {
      console.error("error", error)
    } finally {
      this.assign = "individual";
    }

    this.filteredAttendeeOptions = this.attendee.valueChanges
      .pipe(
        startWith(''),
        map(option => typeof option === 'string' ? option : option.fullname),
        map(option => option ? this._attendeefilter(option) : this.allAttendeeLists.slice())
      );

    this.filteredServices = this.service.valueChanges
      .pipe(
        startWith(''),
        map(option => typeof option === 'string' ? option : option.title),
        map(option => option ? this._filterService(option) : this.serviceLists.slice())
      );
  }

  

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }

  async initializeVariables() {
    
    this.date = new Date(this.passondate)
    
    this.allServiceLists = [];
    this.allPackageLists = [];
    this.allAttendeeLists = [];
    

    this.attendee.setValue(null)
    this.service.setValue(null)

    this.assign = "individual";
    this.form.get('assign').setValue('individual');

    this.recurringoccuranceLists = [];
    for (var i = 2; i < 52; i++) {
      this.recurringoccuranceLists.push(i);
    }
    this.holidayLists = [];

    this.workinghours = {};
    var branch  = this._authService.currentUser.user.branchid;
    this.workinghours = branch.workinghours;

    return;
  }

  // contacts

  async getAllContacts() {

    var url = "common/contacts/filter";
    var method = "POST";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          this.allAttendeeLists = []
          this.allAttendeeLists = data;
          this.allAttendeeLists.map(p=>p.src = p.profilepic ? p.profilepic : '../../assets/img/default-avatar.png')
          return;
        }
      }, (error) => {
        console.error(error);
      });
  }

  enterAttendee() {
    const controlValue = this.attendee.value;
    this.attendee.setValue(controlValue);
  }

  preloadAttendeedata() {
    if (this.allAttendeeLists && this.allAttendeeLists.length == 0) {
      this.getAllContacts()
    }
  }

  handleEmptyAttendeeInput(event: any) {
    if (event.target.value === '') {
      this.attendee.setValue("");
      this.allAttendeeLists = [];
    }
  }

  displayAttendeeFn(user: any): string {
    return user && user.fullname ? user.fullname : '';
  }

  optionAttendeeSelected(option: any) {
    this.attendee.setValue(option.value);
  }

  private _attendeefilter(value: string): string[] {
    let results;
    if (value) {
      results = this.allAttendeeLists
        .filter(option => {
          if (option.fullname) {
            return option.fullname.toLowerCase().indexOf(value.toLowerCase()) === 0
          } else {
            return;
          }
        });
      if (results.length < 1) {
        results = [];
      }
    } else {
      results = this.allAttendeeLists.slice();
    }
    return results;
  }


  async getFacilityAvailByDate(date: Date, serviceLists: any) {

    var today = new Date(date);
    today.setHours(0, 0, 0, 0);

    var tommrrow = new Date(this.date);
    tommrrow.setDate(tommrrow.getDate() + 1);
    tommrrow.setHours(0, 0, 0, 0);

    var serviceids = serviceLists.map(choice => (choice._id));

    var url = "analyticsreports/process";
    var method = "POST";

    let postData = {};
    postData['id'] = "61a0c5c04220efd6ed1feec6";
    
    postData['search'] = [];
    postData['search'].push({ "searchfield": 'facilityids', "searchvalue": serviceids, "criteria": "in", "datatype": "ObjectId"});
    postData['search'].push({ "searchfield": 'startdate', "searchvalue": today, "criteria": "eq", "datatype": "date" });
    postData['search'].push({ "searchfield": 'enddate', "searchvalue": tommrrow, "criteria": "eq", "datatype": "date" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          //console.log("data", data);
          return data;
        }
      }, (error) => {
        console.error(error);
      });
  }

  //Service
  async getServiceLists() {

    var url = "/assets/filter";
    var method = "POST";

    let postData = {};
    postData['search'] = [];
    postData['search'].push({ "searchfield": 'status', "searchvalue": "active", "criteria": "eq" });
    postData['search'].push({ "searchfield": 'bookingtype', "searchvalue": "HOURLY", "criteria": "eq" });

    this.serviceisLoadingBox = true;

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then(async (data: any) => {

        if (data && data[0]) {

          this.allServiceLists = [];
          this.allServiceLists = data;

          var result = await this.getFacilityAvailByDate(this.date, this.allServiceLists);

          this.allServiceLists.map(p=>p.type = "service");
          this.allServiceLists.map(p=>p.img = "https://upload.wikimedia.org/wikipedia/commons/f/f7/Flag_of_Texas.svg");

          this.serviceLists = [];

          this.allServiceLists.forEach(element => {

            element.disable = false;
            var analyticsObj = result.find(p=> ((p._id == element._id) && (new Date(p.date).toDateString() === new Date(this.date).toDateString()) ));
            if(analyticsObj && analyticsObj.isnoavailable) {
              element.disable = true;
            }

            if(element && element.category && element.category.property && element.category.property.name) {
              var serviceObj = this.serviceLists.find(p=>p._id == element.category._id);
              if(!serviceObj) {
                let obj = {
                  _id: element.category._id,
                  name: element.category.property.name,
                  children: []
                }
                obj['children'].push(element);
                this.serviceLists.push(obj);
              } else {
                let obj = {
                  _id: element.category._id,
                  name: element.category.property.name,
                  children: []
                }
                this.serviceLists.push(obj);
              }
            }
          });

          console.log("serviceLists", this.serviceLists);

          this.serviceisLoadingBox = false;
          return;
        }
      }, (error) => {
        console.error(error);
        this.serviceisLoadingBox = false;
      });

  }

  async getpackageLists() {

    var url = "/memberships/filter/";
    var method = "POST";

    let postData = {};
    postData['search'] = [];
    postData['search'].push({ "searchfield": 'status', "searchvalue": "active", "criteria": "eq" });

    this.serviceisLoadingBox = true;

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {

        if (data && data[0]) {

          this.allPackageLists = [];
          this.allPackageLists = data;
          
          this.allPackageLists.map(p=>p.type = "package");
          this.allPackageLists.map(p=>p.title = p.membershipname);
          this.allPackageLists.map(p=>p.img = "https://upload.wikimedia.org/wikipedia/commons/f/f7/Flag_of_Texas.svg");

          let obj = {
            name: "packages",
            children: []
          }

          this.allPackageLists.forEach(element => {
            obj['children'].push(element);
          });
          this.serviceLists.push(obj);

          this.serviceisLoadingBox = false;

          return;
        }

      }, (error) => {
        console.error(error);
        this.serviceisLoadingBox = false;
      });

  }

  private _filterService(value: string): any[] {
    if (value) {
      return this.serviceLists
        .map(group => ({name: group.name, children: _filter(group.children, value)}))
        .filter(group => group.children.length > 0);
    }
    return this.serviceLists;
  }

  async preloaddata() {
    if (this.serviceLists && this.serviceLists.length == 0) {
      await this.getServiceLists();
      await this.getpackageLists();
    }
  }

  enter() {
    const controlValue = this.service.value;
    this.service.setValue(controlValue);
  }

  handleEmptyInput(event: any) {
    if (event.target.value === '') {
      this.service.setValue("");
      this.serviceLists = [];
    }
  }

  displayFn(pkg: any): string {
    return pkg && pkg.title ? pkg.title : '';
  }

  async optionSelected(option: any) {

    this.service.setValue(option.value);
    
    if(this.service && this.service.value && this.service.value.type == "service") {

      if(this.service.value.disable) {
        this.disableBtn = true;
      }

      this.service.value.timeslotLists = [];
      this.service.value.appointmentscheduleList = [];
      
      var istoday: boolean = false;
      var today = new Date();
      var selectedDay = this.getDayName(this.date);

      var starttime = this.service.value['availability'].starttime;
      var endtime = this.service.value['availability'].endtime;
      var duration = this.service.value['duration'];

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

      if (today.getFullYear() == this.date.getFullYear() && today.getMonth() == this.date.getMonth() && today.getDate() == this.date.getDate()) {
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
          "id": this.uuidv4(),
          "day": selectedDay,
          "starttime": start,
          "endtime": end,
          "displaytext": start + " - " + end,
          "disabled": disabled,
        }

        this.service.value.timeslotLists.push(obj);
        time += parseInt(duration);

        
      }

      let group: any = {};
      group['date'] = new FormControl(new Date(this.date), Validators.compose([Validators.required]));
      group['timeslot'] = new FormControl(null, Validators.compose([Validators.required]));
      group['schedule'] = new FormControl(null);
      group['recurringtype'] = new FormControl(null);
      group['recurringoccurance'] = new FormControl(null);
      group['onlinemeet'] = new FormControl(null);
      group['onlinemeeturl'] = new FormControl(null);

      this.form.addControl(this.service.value._id, this.fb.group(group));

    } else if(this.service && this.service.value && this.service.value.type == "package" && this.service.value.services && this.service.value.services.length > 0) {

      this.service.value.services.forEach(async element => {
        
        element.timeslotLists = [];
        element.staffvisible = true;
        
        var istoday: boolean = false;
        var today = new Date();
        var selectedDay = this.getDayName(this.date);

        var starttime = element['serviceid']['availability'].starttime;
        var endtime = element['serviceid']['availability'].endtime;
        var duration = element['serviceid']['duration'];

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

        if (today.getFullYear() == this.date.getFullYear() && today.getMonth() == this.date.getMonth() && today.getDate() == this.date.getDate()) {
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
            "id": this.uuidv4(),
            "day": selectedDay,
            "starttime": start,
            "endtime": end,
            "displaytext": start + " - " + end,
            "disabled": disabled,
          }

          element.timeslotLists.push(obj);
          time += parseInt(duration);

        }

        let group: any = {};
        group['date'] = new FormControl(new Date(this.date), Validators.compose([Validators.required]));
        group['timeslot'] = new FormControl(null, Validators.compose([Validators.required]));
        group['staff'] = new FormControl(null, Validators.compose([Validators.required]));
        group['onlinemeet'] = new FormControl(null);
        group['onlinemeeturl'] = new FormControl(null);

        this.form.addControl(element.serviceid._id, this.fb.group(group));

      });
    }
  }

  uuidv4() {
    let uuid = '', i, random;
    for (i = 0; i < 20; i++) {
      random = Math.random() * 14 | 0;
      if (i == 8 || i == 14) {
        uuid += '-'
      }
      uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
    }
    return uuid;
  }

  getDayName(date: Date) {
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var d = new Date(date);
    return days[d.getDay()];
  }

  myFilter = (d: Date): boolean => {
    
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var dayName = days[new Date(d).getDay()];

    return  this.isInArray(this.holidayLists, d) && this.workinghours.days.includes(dayName);
  }

  isInArray(array: any, value: Date) {
    var check = array.find(item=> new Date(item.date).toDateString() == new Date(value).toDateString())
    if(check) {
      return false
    } else {
      return true
    }
  }

  async getAllHolidays() {

    var url = "common/viewcalendar/filter"
    var method = "POST";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "date", "searchvalue": new Date(this.date.getFullYear(), 0, 1), "criteria": "gte", "datatype": "Date", "cond": "and" });
    postData["search"].push({ "searchfield": "date", "searchvalue": new Date(this.date.getFullYear() + 1, 0, 1), "criteria": "lte", "datatype": "Date", "cond": "and" });
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq", "datatype": "text" });
    postData["search"].push({ "searchfield": "type", "searchvalue": "holiday", "criteria": "eq", "datatype": "text" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          this.holidayLists = [];
          this.holidayLists = data;
          return;
        }
      }, (error) => {
        console.error(error);
      });

  }

  isHoliday(date: any) {
    
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var dayName = days[new Date(date).getDay()];
    
    var working = this.workinghours.days.includes(dayName);
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

  getTimeSlot(timeslots: any, value: any) {
    var timslotObj = timeslots.find(p=>p.id == value);
    if(timslotObj) {
      return timslotObj.displaytext ? timslotObj.displaytext : '';
    }
  }

  async dateChange(serviceid: any, event: MatDatepickerInputEvent<Date>) {

    var date = new Date(event.value);
    
    if(this.service && this.service.value && this.service.value.type == "service") {

      var result = await this.getFacilityAvailByDate(date, this.allServiceLists);
      this.serviceLists = [];
      this.allServiceLists.forEach(element => {

        element.disable = false;
        this.disableBtn = false;
        var analyticsObj = result.find(p=> ((p._id == element._id) && (new Date(p.date).toDateString() === new Date(this.date).toDateString()) ));
        if(analyticsObj && analyticsObj.isnoavailable) {
          element.disable = true;
          this.disableBtn = true;
        }

        if(element && element.category && element.category.property && element.category.property.name) {
          var serviceObj = this.serviceLists.find(p=>p._id == element.category._id);
          if(!serviceObj) {
            let obj = {
              _id: element.category._id,
              name: element.category.property.name,
              children: []
            }
            obj['children'].push(element);
            this.serviceLists.push(obj);
          } else {
            let obj = {
              _id: element.category._id,
              name: element.category.property.name,
              children: []
            }
            this.serviceLists.push(obj);
          }
        }
      });

      let obj = {
        name: "packages",
        children: []
      }

      this.allPackageLists.forEach(element => {
        obj['children'].push(element);
      });
      this.serviceLists.push(obj);
      
      console.log("serviceLists", this.serviceLists);
      this.serviceisLoadingBox = false;

    }
  }

  onScheduleChanged(id: any, event: MatCheckboxChange): void {
    if(event.checked) {
      this.disableBtn = true;
      this.form.get([id, 'recurringtype']).setValue("daily");
      this.form.get([id, 'recurringoccurance']).setValue(2);
    } else {
      this.disableBtn = false;
      this.form.get([id, 'recurringtype']).setValue("");
      this.form.get([id, 'recurringoccurance']).setValue(0);
    }
  }

  onRecurringChanged(event: any) {
    if(this.service.value._id) {
      this.service.value.appointmentscheduleList = [];
    }
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

  addtime() {

    if (this.form.get([this.service.value._id, 'date']).value !== null) {
      this.service.value.appointmentscheduleList = [];

      var startDate = new Date(this.form.get([this.service.value._id, 'date']).value);
      

      if (this.form.get([this.service?.value?._id, 'schedule']).value == true) {

        if (this.form.get([this.service?.value?._id, 'recurringtype']).value !== "") {

          this.service.value.appointmentscheduleList.push(startDate);

          if (this.form.get([this.service?.value?._id, 'recurringtype']).value == "daily") {
            for (var i = 0; i < this.form.get([this.service?.value?._id, 'recurringoccurance']).value - 1; i++) {
              startDate = this.getNextDay(startDate);
              this.service.value.appointmentscheduleList.push(startDate);
            }
          } else if (this.form.get([this.service?.value?._id, 'recurringtype']).value == "weekly") {
            for (var i = 0; i < this.form.get([this.service?.value?._id, 'recurringoccurance']).value - 1; i++) {
              startDate = this.getNextDayOfWeek(startDate, startDate.getDay())
              this.service.value.appointmentscheduleList.push(startDate);
            }
          } else if (this.form.get([this.service?.value?._id, 'recurringtype']).value == "monthly") {
            for (var i = 0; i < this.form.get([this.service?.value?._id, 'recurringoccurance']).value - 1; i++) {
              startDate = this.getNexyDayOfMonth(startDate);
              this.service.value.appointmentscheduleList.push(startDate);
            }
          }

          setTimeout(() => {
            if(this.service.value.appointmentscheduleList.length > 0 ) {
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

      }

    } else {
      this.showNotification('top', 'right', 'Date cannot be empty!!!', 'danger');
      return;
    }
  }

  getNextDay(date: Date) {
    var resultDate = new Date(date.getTime());
    resultDate = new Date(resultDate.setDate(resultDate.getDate() + 1));
    return resultDate;
  }

  getNextDayOfWeek(date: Date, dayOfWeek: any) {
    var resultDate = new Date(date.getTime());
    resultDate.setDate(date.getDate() + (7 + dayOfWeek - date.getDay() - 1) % 7 + 1);
    return resultDate;
  }

  getNexyDayOfMonth(date: Date) {
    var resultDate = new Date(date.getTime());
    resultDate = new Date(resultDate.setMonth(resultDate.getMonth() + 1));
    return resultDate;
  }

  showOptions(id: any, event: MatCheckboxChange): void {
    if(event.checked) {
      this.form.get([id, 'onlinemeeturl']).setValidators([Validators.required]); 
    } else {
      this.form.get([id, 'onlinemeeturl']).clearValidators();
    }
    this.form.get([id, 'onlinemeeturl']).updateValueAndValidity();
  }

  removeStep(index: number, id: any) {

    if(this.service && this.service.value && this.service.value.services && this.service.value.services.length > 0 ) {

      const varTemp = this;

      swal.fire({
        title: 'Are you sure?',
        text: 'You will not be able to recover this Service!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, keep it',
        customClass:{
          confirmButton: "btn btn-success",
          cancelButton: "btn btn-danger",
        },
        buttonsStyling: false
      }).then((result) => {
        if (result.value) {

          varTemp.service.value.services.splice(index, 1);
          varTemp.form.removeControl(id); 

          swal.fire({
            title: 'Deleted!',
            text: 'Service has been deleted.',
            icon: 'success',
            customClass:{
              confirmButton: "btn btn-success",
            },
            buttonsStyling: false
          });

        } else {
          swal.fire({
            title: 'Cancelled',
            text: 'Service is safe :)',
            icon: 'error',
            customClass:{
              confirmButton: "btn btn-info",
            },
            buttonsStyling: false
          });
        }
      })

    }
  }

  setStep(index: number) {
    this.step = index;
  }

  nextStep(index: number) {
    this.step++;
  }

  prevStep(index: number) {
    this.step--;
  }

  saveAndSubmit(index: number) {
    this.nextStep(index)
    $("#submit").click();
  }

  cancel() {
    this.form.reset();
    this.onBookingData.emit("cancel");
  }

  onSubmit(value: any, isValid: boolean) {
    this.submitted = true;
    if (!isValid) {
      this.showNotification('top', 'right', 'Fill required fields !!', 'danger');
      return false;
    }  else {

      if (this.type == "multi" && this.assign == "individual" && (!value.attendee || !value.attendee.value)) {
        this.showNotification('top', 'right', 'Please select attendee !!', 'danger');
        return;
      }

      if ((!value.service || !value.service.value)) {
        this.showNotification('top', 'right', 'Please select service !!', 'danger');
        return;
      }

      if ((typeof value.service.value === 'string')) {
        this.showNotification('top', 'right', 'Please select valid service !!', 'danger');
        return;
      }

      if(this.service.value && this.service.value.type == "package" && this.service.value.services && this.service.value.services.length == 0) {
        this.showNotification('top', 'right', 'Select atleast One Service !!', 'danger');
        return;
      }

      let postData = {};

      var services = [];

      if(this.service.value && this.service.value.type && this.service.value.type == "service") {


        postData['refid']  = this.service.value._id;

        var timeslot = {};
        var timslotObj = this.service.value.timeslotLists.find(p=>p.id == this.form.get([this.service.value._id, 'timeslot']).value);
        if(timslotObj) {
          timeslot = {
            "day" : timslotObj.day, 
            "starttime" : timslotObj.starttime, 
            "endtime" : timslotObj.endtime,
          };
        }

        var property = {};

        if(this.form.get([this.service.value._id, 'onlinemeet']).value == true) {
          property['onlinemeet'] = true;
          property['onlinemeeturl'] = this.form.get([this.service.value._id, 'onlinemeeturl']).value;
        }

        if(this.form.get([this.service.value._id, 'schedule']).value == true) {
          if(this.service.value.appointmentscheduleList.length > 0) {
            this.service.value.appointmentscheduleList.forEach(elementDate => {

              let obj = {
                refid: this.service.value._id,
                date: new Date(elementDate),
                timeslot: timeslot,
                charges: this.service.value.charges ? this.service.value.charges : 0,
                duration: this.service.value.duration ? this.service.value.duration : 30,
                property: property
              }
              services.push(obj);
            });
          }
        } else {

          let obj = {
            refid: this.service.value._id,
            date: new Date(this.form.get([this.service.value._id, 'date']).value),
            timeslot: timeslot,
            charges: this.service.value.charges ? this.service.value.charges : 0,
            duration: this.service.value.duration ? this.service.value.duration : 30,
            property: property
          }
          services.push(obj);
        }

      } else if (this.service.value && this.service.value.type && this.service.value.type == "package") {

        if(this.service.value && this.service.value.services && this.service.value.services.length > 0) {

          this.service.value.services.forEach(element => {
  
            var timeslot = {};
  
            var timslotObj = element.timeslotLists.find(p=>p.id == this.form.get([element.serviceid._id, 'timeslot']).value);
            if(timslotObj) {
              timeslot = {
                "day" : timslotObj.day, 
                "starttime" : timslotObj.starttime, 
                "endtime" : timslotObj.endtime,
              };
            }

            var property = {};

            if(this.form.get([element.serviceid._id, 'onlinemeet']).value == true) {
              
              property = {};
              property['onlinemeet'] = true;
              property['onlinemeeturl'] = this.form.get([element.serviceid._id, 'onlinemeeturl']).value;
            }

            postData['refid']  = element.serviceid._id;

            let obj = {
              refid: element.serviceid._id,
              date: new Date(this.form.get([element.serviceid._id, 'date']).value),
              timeslot: timeslot,
              charges: element.serviceid.charges ? element.serviceid.charges : 0,
              duration: element.serviceid.duration ? element.serviceid.duration : 30,
              property: property
            }
  
            services.push(obj);

          });
        }
      }

      
      
      
      postData['services'] = services;

      if(this.type == "multi" && this.assign == "individual") {
        postData['onModel'] = "Member";
        if (this.attendee && this.attendee.value && this.attendee.value.type) {
          switch (this.attendee.value.type) {
            case "M":
              postData['onModel'] = "Member";
              break;
            case "C":
              postData['onModel'] = "Prospect";
              break;
            case "U":
              postData['onModel'] = "User";
              break;
            default:
              postData['onModel'] = "Member";
          }
        }
        postData['attendee'] =  value.attendee.value._id ? value.attendee.value._id : this.dataContent._id;
      } 

      this.disableBtn = true;

      var url = "facilitybookings/multi";
      var method = "POST";

      

      return this._commonService
        .commonServiceByUrlMethodDataAsync(url, method, postData)
        .then((data: any) => {
          if (data) {
            this.disableBtn = false;

            super.showNotification('top', 'right', 'Facility has been added Successfully !!', 'success');
            this.service.setValue("")
            this.attendee.setValue("")
            this.form.reset();
            this.onBookingData.emit("success");
            return;
          }
        }, (error) => {
          console.error(error);
          this.disableBtn = false;
        });

    }
  }

}
