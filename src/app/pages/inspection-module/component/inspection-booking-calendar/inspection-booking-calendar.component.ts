import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';

import { BaseComponemntComponent } from '../../../../shared/base-componemnt/base-componemnt.component';
import { BaseComponemntInterface } from '../../../../shared/base-componemnt/base-componemnt.component';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CalendarOptions, DateSelectArg, EventClickArg } from '@fullcalendar/angular'; // useful for typechecking

import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import * as moment from 'moment';

import { MatRadioChange } from '@angular/material/radio';
import { MatSelectionListChange } from '@angular/material/list';

import { AppointmentModel } from '../../../../core/models/appointment/appointment.model';

declare var $: any;
import swal from 'sweetalert2';
import { MatCheckboxChange } from '@angular/material/checkbox';

function autocompleteObjectValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    if (typeof control.value === 'string') {
      return { 'invalidAutocompleteObject': { value: control.value } }
    }
    return null  /* valid option selected */
  }
}

@Component({
  selector: 'app-inspection-booking-calendar',
  templateUrl: './inspection-booking-calendar.component.html',
  styles: [

    `
      ::ng-deep .fc-daygrid-event-dot {
        display: none !important
      }

      ::ng-deep .fc-event-title {
          margin-left: 10px !important;
      }

      ::ng-deep span.fc-col-header-cell-cushion {
        word-break: break-word
      }

      .example-option-img {
        vertical-align: middle;
        margin-right: 8px;
      }

      [dir='rtl'] .example-option-img {
        margin-right: 0;
        margin-left: 8px;
      }

    `
  ]
})
export class InspectionBookingCalendarComponent extends BaseComponemntComponent implements OnInit, BaseComponemntInterface  {

  _appointmentModel = new AppointmentModel();

  destroy$: Subject<boolean> = new Subject<boolean>();
  isLoading: boolean = false;

  form: FormGroup;
  submitted: boolean;
  disableBtn: boolean = false;
  
  events: any [] = [];
  calendarOptions: CalendarOptions;

  _id: any;
  date: Date;
  timeslotid = new FormControl();
  schedule: boolean = false;
  recurringtype: any;
  recurringoccurance: any;
  days: string[] = [];
  enddate: Date;
  mindate: Date = new Date();

  slotDuration: string;
  slotMinTime: string;
  slotMaxTime: string;
  height: number;

  alltimeslotLists: any[] = [];
  timeslotfilteredOptions: Observable<string[]>;
  timeisLoadingBox: boolean = false;

  resources: any [] = [];

  recurringtypeLists: any[] = [
    { id: "daily", name: "Daily" },
    { id: "weekly", name: "Weekly" },
    { id: "monthly", name: "Monthly" },
  ];
  recurringoccuranceLists: any[] = [];
  appointmentscheduleList: any[] = [];
  options = [
    { value: "Monday", checked: false },
    { value: "Tuesday", checked: false },
    { value: "Wednesday", checked: false },
    { value: "Thursday", checked: false },
    { value: "Friday", checked: false },
    { value: "Saturday", checked: false },
    { value: "Sunday", checked: false },
  ];
  checked: string[] = [];

  serviceDetail: any = {};

  
  attendee = new FormControl();
  attendeeoptions: string[] = [];
  filteredAttendeeOptions: Observable<string[]>;
  allAttendeeLists: any[] = [];
  attendeeisLoadingBox: boolean = false;


  hostid = new FormControl();
  hostoptions: string[] = [];
  filteredHostOptions: Observable<string[]>;
  allHostLists: any[] = [];
  hostisLoadingBox: boolean = false;

  selectedAppointment: any;

  showModal: boolean;

  appointmentLists: any [] = [];

  workinghours: any = {};
  holidayLists: any[] = [];

  userLists: any [] = [];

  dateInfo: any = {};
  index: number;

  constructor(
    private fb: FormBuilder,
  ) { 
    super()
    this.pagename="app-inspection-booking-calendar";

    this.form = fb.group({
      '_id': [this._id],
      'date': [this.date, Validators.required],
      'timeslotid': [this.timeslotid, { validators: [autocompleteObjectValidator(), Validators.required] }],
      'attendee': [this.attendee, { validators: [autocompleteObjectValidator(), Validators.required] }],
      'schedule': [this.schedule],
      'recurringtype': [this.recurringtype],
      'days': [this.days],
      'recurringoccurance': [this.recurringoccurance],
      'enddate': [this.enddate],
      'hostid': [this.hostid],
    });

  }

  public validation_msgs = {
    
    'timeslotid': [
      { type: 'invalidAutocompleteObject', message: 'Timeslot is not recognized. Click one of the autocomplete options.' },
      { type: 'required', message: 'Time slot is required.' }
    ],

    'attendee': [
      { type: 'invalidAutocompleteObject', message: 'Asset is not recognized. Click one of the autocomplete options.' },
      { type: 'required', message: 'Asset is required.' }
    ],

  }

  async ngOnInit() {

    try {
      await super.ngOnInit()
      await this.initializeVariables()
      await this.getServiceData()
      await this.getAllAssets();
      await this.getCalendarData();
      await this.getAllHost()
      await this.getAllHolidays()
    } catch(error) {
      console.error(error)
    } finally {

      await this.loadData();

      this.timeslotfilteredOptions = this.timeslotid.valueChanges
      .pipe(
        startWith(''),
        map(option => typeof option === 'string' ? option : option.displaytext),
        map(option => option ? this._timefilter(option) : this.alltimeslotLists.slice())
      );

      this.filteredAttendeeOptions = this.attendee.valueChanges
      .pipe(
        startWith(''),
        map(option => typeof option === 'string' ? option : option.fullname),
        map(option => option ? this._attendeefilter(option) : this.allAttendeeLists.slice())
      );

      
      this.filteredHostOptions = this.hostid.valueChanges
      .pipe(
        startWith(''),
        map(option => typeof option === 'string' ? option : option.fullname),
        map(option => option ? this._hostfilter(option) : this.allHostLists.slice())
      );

    }
  }

  LoadData() {}
  Save() {}
  Update() {}
  Delete() {}
  ActionCall() {}


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

  async initializeVariables() {

    this.isLoading = true;
    this.disableBtn = false;
    this.height = 1350;
    this.slotDuration = "00:15:00";
    this.slotMinTime = "00:00:00";
    this.slotMaxTime = "24:00:00";
    this.date = new Date();
    this.form.get("date").setValue(this.date);
    this.events = [];
    this.serviceDetail = {};
    

    this.form.get("schedule").setValue(false);

    this.recurringtype = "";
    this.recurringoccurance = 8;
    this.recurringoccuranceLists = [];
    for (var i = 2; i < 52; i++) {
      this.recurringoccuranceLists.push(i);
    }
    this.appointmentscheduleList = [];
    this.resources = [];
    this.appointmentLists = [];

    this.workinghours = {};
    this.workinghours = this._loginUserBranch.workinghours;

    this.holidayLists = [];
    this.userLists = [];

    this.dateInfo = {};
    this.index = 0;
    return;
  }

  async getAllHost() {
    
    this.allHostLists = [];

    if(this.userLists && this.userLists.length > 0 ) {
      this.userLists.forEach(element => {
        this.allHostLists.push(element);
      });
    }

  }

  async getServiceData() {

    var url = "users/filter"
    var method = "POST";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });
    //postData["search"].push({ "searchfield": "title", "searchvalue": "General Booking", "criteria": "eq" });
    
    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {

          // this.serviceDetail = {};
          // this.serviceDetail = data[0];

          this.userLists = [];
          this.userLists = data;

          this.resources = [];
          this.resources.push({id: "0", title: "Unassign"});

          if(this.userLists && this.userLists.length > 0 ) {
            this.userLists.forEach(element => {
              element.id = element._id;
              element.title = element.fullname;
              this.resources.push(element);
            });
          }

          var istoday: boolean = false;
          var today = new Date();
          var selectedDay = this.getDayName(this.date);

          var branch  = this._authService.currentUser.user.branchid;
          var starttime = branch && branch['workinghours'] && branch['workinghours']['starttime'] ? branch['workinghours']['starttime'] : '';
          var endtime = branch && branch['workinghours'] && branch['workinghours']['endtime'] ? branch['workinghours']['endtime'] : '';
          var duration = 30;

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
              timemin += duration;
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
            this.alltimeslotLists.push(obj);
            time += duration;
          }
                
          this.timeisLoadingBox = false;
          return;
        }
      }, (error) => {
        console.error(error);
        this.isLoading = false;
      });

  }

  async getAllHolidays() {

    var url = "common/viewcalendar/filter"
    var method = "POST";

    let postData = {};
    postData["search"] = [];
    //postData["search"].push({ "searchfield": "branchid", "searchvalue": this._loginUserBranchId, "criteria": "eq", "datatype": "ObjectId" });
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

  async getCalendarData() {

    var url = "appointments/filter"
    var method = "POST";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "onModel", "searchvalue": "Asset", "criteria": "eq" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {

          this.appointmentLists = [];
          this.appointmentLists = data;

          data.forEach(element => {

            if(element.status == "noshow") {
              element.color = '#f57c00' // override!
            } else if(element.status == "cancel") {
              element.color = '#FB3E39' // override!
            } else if(element.status == "confirmed") {
              element.color = '#E152BF' // override!
            }

            element.memberprofilepic = element && element.attendee && element.attendee.customerid && element.attendee.customerid.profilepic ? element.attendee.customerid.profilepic : './assets/img/default-avatar.png';

            let starttimeArr = element.timeslot.starttime.split(":");
            let endtimeArr = element.timeslot.starttime.split(":");

            let start = new Date(element.appointmentdate)
            start.setHours(starttimeArr[0]);
            start.setMinutes(starttimeArr[1]);

            let end = new Date(element.appointmentdate)
            end.setHours(endtimeArr[0]);
            end.setMinutes(endtimeArr[1]);

            element.title = element?.attendee?.customerid?.fullname + " --- " +element?.attendee?.title;
            element.date = element.appointmentdate;

            element.start = start;
            element.end = end;

            element.resourceId = element.host && element.host._id ? element.host._id : element.host ? element.host : '0';

            var customStatus = "";

            if(element && element.property && element.property.joborderid) {
              customStatus = "Job Order";
            } else if (element && element.property && element.property.quotationid) {
              customStatus = "Estimate";
            } else if (element && element.property && element.property.inspectionid) {
              customStatus = "Inspection";
            }

            element.extendedProps = {
              customername: 'custom',
              customstatus: customStatus
            }

            this.events.push(element);
          });

          return;
        }
      }, (error) => {
        console.error(error);
        this.isLoading = false;
      });
    
  }

  async loadData() {

    
    this.calendarOptions = {
      initialView: 'resourceTimeGridDay',
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'resourceTimeGridDay, timeGridWeek, dayGridMonth'
        },
      selectable: true,
      weekends: true,
      resources: this.resources,
      events: this.events,
      schedulerLicenseKey: 'CC-Attribution-NonCommercial-NoDerivatives',
      height: this.height,
      allDaySlot: false,
      slotDuration: this.slotDuration,
      slotMinTime: this.slotMinTime,
      slotMaxTime: this.slotMaxTime,
      displayEventTime: false,
      initialDate: this.date,
      select: this.handleDateSelect.bind(this),
      eventClick: this.handleEventClick.bind(this),
      eventDidMount: function(info) {

        if(info && info.event && info.event.extendedProps && info.event.extendedProps.customstatus && info.event.extendedProps.customstatus !== "") {
          
          var customstatus = info.event.extendedProps.customstatus;
          var customTitleForMonth = info?.event?.title;
          $(info.el).find(".fc-sticky").html("<span class='d-inline'>"+ customTitleForMonth +"</span><br><br><span> Status: "+ customstatus +"</span>");
        }
        
        
      },
      eventMouseEnter: eventEnter => {
        //console.log("eventMouseEnter called");
      },
      eventMouseLeave: eventLeave => {
        //console.log("eventMouseLeave called");
      },
      eventDrop: eventDrop => {
        //this.handleEventDrop(eventDrop); // Call custom code
      },
      datesSet: (dateInfo) => {
        this.search(dateInfo); // Call custom code
      }
    };
    this.isLoading = false;
    return;
  }

  async getAllAssets() {

    var url = "assets/filter"
    var method = "POST";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });
    
    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          this.allAttendeeLists = [];
          this.allAttendeeLists = data;
          this.allAttendeeLists.map(p=>p.src = p.profilepic ? p.profilepic : '../../assets/img/default-avatar.png')
          return;
        }
      }, (error) => {
        console.error(error);
      });
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

  handleDateSelect(selectInfo: DateSelectArg) {
  }

  handleEventClick(clickInfo: EventClickArg) {
    this.selectedAppointment = {};
    var appointmentObj = this.appointmentLists.find(p => p._id == clickInfo.event.id)
    if (appointmentObj) {

      this.selectedAppointment = appointmentObj;
      this.selectedAppointment.title = clickInfo.event.title;
      this.showModal = true;
    }
    
    
  }

  hide() {
    this.showModal = false;
  }

  async search(dateInfo: any) {

    this.dateInfo = {};
    this.dateInfo = dateInfo;

    if(this.index !== 0) {
      try {
        this.date = new Date(dateInfo.start)
        await this.getCalendarData();
      } catch(error) {
        console.log(error)
      } finally {
      }
    } else if (this.index == 0) {
      this.index++
    }

  }

  timeDisplayFn(time: any): string {
    return time && time.displaytext ? time.displaytext : '';
  }

  private _timefilter(value: string): string[] {
    let results;
    if (value) {
      results = this.alltimeslotLists
        .filter(option => {
          if (option.displaytext) {
            return option.displaytext.toLowerCase().indexOf(value.toLowerCase()) === 0
          } else {
            return;
          }
        });
      if (results.length < 1) {
        results = [];
      }
    } else {
      results = this.alltimeslotLists.slice();
    }
    return results;
  }

  onScheduleChanged(event: MatCheckboxChange): void  {

    if(event.checked) {
      this.disableBtn = true;
      this.form.get('recurringtype').setValue("daily");
      this.form.get('recurringoccurance').setValue(2);
    } else {
      this.disableBtn = false;
      this.form.get('recurringtype').setValue("");
      this.form.get('recurringoccurance').setValue(0);
    }
  }

  onRecurringChanged(event: any) {
    this.recurringtype = event;
    this.appointmentscheduleList = [];
  }

  onRecurringOccuranceChanged(event: any) {
    this.recurringoccurance = event;
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

  updateChecked($event: MatSelectionListChange) {
    if ($event.option.selected) {
      this.checked.push($event.option.value);
    } else {
      var index = this.checked.indexOf($event.option.value);
      this.checked.splice(index, 1);
    }
  }

  onEndDateChanged(val: any) {

    if (val) {
      //this.form.get("enddate").setValue(val);
      this.enddate = val;

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

          setTimeout(() => {
            if(this.appointmentscheduleList.length > 0 ) {
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

  removeDate(date: Date) {
    this.remove(date, this.appointmentscheduleList);
  }

  remove(date: Date, array: any) {
    var holidays = [new Date(date)];
    for (let i in array) {
      if (holidays.some(d => +d === + array[i])) {
        array.splice(i, 1);
      }
    }
  }

  onSubmit(value: any, isValid: boolean) {

    this.submitted = true;
    

    if (!isValid) {
      this.showNotification('top', 'right', 'Fill required fields !!', 'danger');
      return false;
    } else {

      if (value.schedule == true && this.appointmentscheduleList && this.appointmentscheduleList.length == 0) {
        this.showNotification('top', 'right', 'Add timeslot', 'danger');
        return;
      }

      
      if (value.schedule == false) {
        this._appointmentModel.appointmentdate = new Date(value.date);
      } else {
        this._appointmentModel.appointmentdate = [];
        this._appointmentModel.appointmentdate = this.appointmentscheduleList;
      }

      this._appointmentModel.onModel = "Asset";
      this._appointmentModel.attendee = value.attendee.value._id;
      this._appointmentModel.refid = this.serviceDetail._id ? this.serviceDetail._id : null;
      this._appointmentModel.timeslot = value.timeslotid.value;
      this._appointmentModel.charges = this.serviceDetail.charges ? this.serviceDetail.charges : 0;
      this._appointmentModel.duration = this.serviceDetail.duration ? this.serviceDetail.duration : 30;
      this._appointmentModel.host = value?.hostid?.value?._id;

      if(value._id) {

        this._appointmentModel._id = value._id;

        var url = "appointments/" + this._appointmentModel._id
        var method = "PATCH";

        this.disableBtn = true;

        

        this._commonService
          .commonServiceByUrlMethodData(url, method, this._appointmentModel)
          .subscribe((data: any) => {
            if (data) {
              this.disableBtn = false;
              this.showNotification('top', 'right', 'Appointment has been updated successfully', 'success');
              $("#closeScheduleAsset").click();
              
              this.resetForm()
              this.ngOnInit();
            }
          }, (error) => {
            this.disableBtn = false;
            console.error(error);
          });


      } else {

        

        var url = "appointments"
        var method = "POST";

        this.disableBtn = true;

        this._commonService
          .commonServiceByUrlMethodData(url, method, this._appointmentModel)
          .subscribe((data: any) => {
            if (data) {
              this.disableBtn = false;
              this.showNotification('top', 'right', 'Appointment has been added successfully', 'success');
              $("#closeScheduleAsset").click();
              this.resetForm()
              this.ngOnInit();
            }
          }, (error) => {
            this.disableBtn = false;
            console.error(error);
          });

      }
    }

  }

  resetForm() {
    this.hostid.setValue("");
    this.attendee.setValue("")
    this.selectedAppointment = {};
    this.timeslotid.setValue("")
    this.form.reset();
    this.form.get("schedule").setValue(false);
  }

  private _attendeefilter(value: string): string[] {
    let results;
    if (value) {
      results = this.allAttendeeLists
        .filter(option => {
          if (option.title && option.customerid && option.customerid.fullname) {
            return (option.title.toLowerCase().indexOf(value.toLowerCase()) > -1) || (option.customerid.fullname.toLowerCase().indexOf(value.toLowerCase()) > -1)
          } else if(option.title) {
            return option.title.toLowerCase().indexOf(value.toLowerCase()) === 0
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

  enterAttendee() {
    const controlValue = this.attendee.value;
    this.attendee.setValue(controlValue);
  }

  preloadAttendeedata() {
    if (this.allAttendeeLists && this.allAttendeeLists.length == 0) {
      this.getAllAssets()
    }
  }

  handleEmptyAttendeeInput(event: any) {
    if (event.target.value === '') {
      this.attendee.setValue("");
      this.allAttendeeLists = [];
    }
  }

  displayAttendeeFn(user: any): string {
    return user && user.title ? user.title : '';
  }

  optionAttendeeSelected(option: any) {
    this.attendee.setValue(option.value);
    this.form.get("attendee").setValue(this.attendee);
  }

  optionTimeslotSelected(option: any) {
    this.timeslotid.setValue(option.value);
    this.form.get("timeslotid").setValue(this.timeslotid);
  }

  enterHost() {
    const controlValue = this.hostid.value;
    this.hostid.setValue(controlValue);
  }

  async preloadHostdata() {
    if (this.allHostLists && this.allHostLists.length == 0) {
      await this.getAllHost()
    }
  }

  handleEmptyHostInput(event: any) {
    if (event.target.value === '') {
      this.hostid.setValue("");
      this.allHostLists = [];
    }
  }

  displayFn(user: any): string {
    return user && user.title ? user.title : '';
  }

  displayHostFn(user: any): string {
    return user && user.fullname ? user.fullname : '';
  }

  optionHostSelected(option: any) {
    this.hostid.setValue(option.value);
    this.form.get("hostid").setValue(this.hostid);
  }

  private _hostfilter(value: string): string[] {
    let results;
    if (value) {
      results = this.allHostLists
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
      results = this.allHostLists.slice();
    }
    return results;
  }

  appointmentStatus(action: any) {

    if(action == "edit") {

      this.form.controls['_id'].setValue(this.selectedAppointment._id);

      var attendee = this.allAttendeeLists.find(p=>p._id == this.selectedAppointment.attendee._id);
      if(attendee) {
        this.attendee.setValue(attendee);
        this.form.controls['attendee'].setValue(this.attendee);
      }

      this.form.controls['date'].setValue(new Date(this.selectedAppointment.appointmentdate));
      
      var timeslotobj = this.alltimeslotLists.find(p=>p.starttime == this.selectedAppointment.timeslot.starttime && p.endtime == this.selectedAppointment.timeslot.endtime)
      if(timeslotobj) {
        this.timeslotid.setValue(timeslotobj)  
        this.form.controls['timeslotid'].setValue(this.timeslotid);
      }

      this.form.controls['schedule'].setValue(false);

      if(this.selectedAppointment && this.selectedAppointment.host && this.selectedAppointment.host._id) {
        this.hostid.setValue(this.selectedAppointment.host);
        this.form.controls['hostid'].setValue(this.hostid);
      }
      
      this.hide();


      $("#myModalAppointmentBtn").click();
    } else if (action == "inspection") {
      var redirectid = this.selectedAppointment && this.selectedAppointment.property && this.selectedAppointment.property.inspectionid ? this.selectedAppointment.property.inspectionid : this.selectedAppointment._id;
      this.hide();
      this._router.navigate(["pages/inspection-module/inspection/" + redirectid]);
    } else if(action == "estimate" ) {
      var redirectid = this.selectedAppointment && this.selectedAppointment.property && this.selectedAppointment.property.quotationid;
      this.hide();
      this._router.navigate(["pages/inspection-module/estimation/" + redirectid]);
    } else if(action == "joborder") {
      var redirectid = this.selectedAppointment && this.selectedAppointment.property && this.selectedAppointment.property.joborderid;
      this.hide();
      this._router.navigate(["pages/inspection-module/job-order/" + redirectid]);
    } else {
      const varTemp = this;
      swal.fire({
        title: 'Are you sure?',
        text: 'You will not be able to recover this action!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: `Yes, ${action} it!`,
        cancelButtonText: 'No, keep it',
        customClass: {
          confirmButton: "btn btn-success",
          cancelButton: "btn btn-danger",
        },
        buttonsStyling: false
      }).then((result) => {
        if (result.value) {

          let method = "PATCH";
          let url = "appointments/";

          var model = { 'status' : action };

          return varTemp._commonService
            .commonServiceByUrlMethodDataAsync(url, method, model,varTemp.selectedAppointment._id)
            .then((data: any) => {
              if (data) {
                varTemp.hide()
                varTemp.ngOnInit();
                return;
              }
            }, (error) => {
              console.error(error);
            })
        } else {
          swal.fire({
            title: 'Cancelled',
            text: 'Your event is safe :)',
            icon: 'error',
            customClass: {
              confirmButton: "btn btn-info",
            },
            buttonsStyling: false
          });
        }
      })
    }
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

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}
