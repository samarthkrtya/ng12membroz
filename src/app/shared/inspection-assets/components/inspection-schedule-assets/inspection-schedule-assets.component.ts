import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CommonService } from '../../../../core/services/common/common.service';
import { BaseLiteComponemntComponent } from '../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import { CalendarOptions, DateSelectArg, EventClickArg } from '@fullcalendar/angular'; // useful for typechecking

import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import * as moment from 'moment';

import { MatRadioChange } from '@angular/material/radio';
import { MatSelectionListChange } from '@angular/material/list';

import { AppointmentModel } from '../../../../core/models/appointment/appointment.model';

declare var $: any;

function autocompleteObjectValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    if (typeof control.value === 'string') {
      return { 'invalidAutocompleteObject': { value: control.value } }
    }
    return null  /* valid option selected */
  }
}

@Component({
  selector: 'app-inspection-schedule-assets',
  templateUrl: './inspection-schedule-assets.component.html',
  styles: [
  ]
})
export class InspectionScheduleAssetsComponent extends BaseLiteComponemntComponent implements OnInit  {

  _appointmentModel = new AppointmentModel();

  destroy$: Subject<boolean> = new Subject<boolean>();
  isLoading: boolean = false;
  
  form: FormGroup;
  submitted: boolean;
  disableBtn: boolean = false;

  events: any [] = [];

  date: Date;
  timeslotid = new FormControl();
  schedule: any;
  recurringtype: any;
  recurringoccurance: any;
  days: string[] = [];
  enddate: Date;
  mindate: Date = new Date();

  calendarOptions: CalendarOptions;

  slotDuration: string;
  slotMinTime: string;
  slotMaxTime: string;
  height: number;

  alltimeslotLists: any[] = [];
  timeslotfilteredOptions: Observable<string[]>;
  timeisLoadingBox: boolean = false;

  scheduleLists: any[] = [
    { id: "onetime", name: "One Time", checked: true },
    { id: "recurring", name: "Recurring", checked: false },
    { id: "custom", name: "Custom", checked: false },
  ];
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

   constructor(
    private _commonService: CommonService,
    private fb: FormBuilder,
  ) { 

    super()
    this.pagename="app-inspection-assets";

    this.form = fb.group({
      'date': [this.date, Validators.required],
      'timeslotid': [this.timeslotid, { validators: [autocompleteObjectValidator(), Validators.required] }],
      'attendee': [this.attendee, { validators: [autocompleteObjectValidator(), Validators.required] }],
      'schedule': [this.schedule, Validators.required],
      'recurringtype': [this.recurringtype],
      'days': [this.days],
      'recurringoccurance': [this.recurringoccurance],
      'enddate': [this.enddate],
    });

  }

  @Input() dataContent: any;
  @Input() bindId: any;
  @Output() onInspectionAssetData: EventEmitter<any> = new EventEmitter<any>();


  public validation_msgs = {
    
    'timeslotid': [
      { type: 'invalidAutocompleteObject', message: 'Timeslot is not recognized. Click one of the autocomplete options.' },
      { type: 'required', message: 'Time slot is required.' }
    ],

    'attendee': [
      { type: 'invalidAutocompleteObject', message: 'Attendee is not recognized. Click one of the autocomplete options.' },
      { type: 'required', message: 'Attendee is required.' }
    ]


  }

  async ngOnInit() {
    try {
      await super.ngOnInit();
      await this.initializeVariables()
      await this.getServiceData()
      await this.getAllAssets()
      await this.getCalendarData()
      await this.loadData()
    } catch(error) {
      console.error(error);
    } finally {

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

    }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }

  async initializeVariables() {
    this.isLoading = true;
    this.disableBtn = false;
    this.height = 1350;
    this.slotDuration = "00:15:00";
    this.slotMinTime = "00:00:00";
    this.slotMaxTime = "24:00:00";
    this.date = new Date();
    this.events = [];
    this.serviceDetail = {};

    this.form.get("schedule").setValue("onetime");
    this.schedule = "onetime";
    this.recurringtype = "";
    this.recurringoccurance = 8;
    this.recurringoccuranceLists = [];
    for (var i = 2; i < 52; i++) {
      this.recurringoccuranceLists.push(i);
    }
    this.appointmentscheduleList = [];
    return;
  }

  async getServiceData() {

    var url = "services/filter"
    var method = "POST";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });
    postData["search"].push({ "searchfield": "title", "searchvalue": "General Booking", "criteria": "eq" });
    
    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          this.serviceDetail = {};
          this.serviceDetail = data[0];

          var istoday: boolean = false;
          var today = new Date();
          var selectedDay = this.getDayName(this.date);

          var starttime = this.serviceDetail && this.serviceDetail['availability'] && this.serviceDetail['availability']['starttime'] ? this.serviceDetail['availability']['starttime'] : '';
          var endtime = this.serviceDetail && this.serviceDetail['availability'] && this.serviceDetail['availability']['endtime'] ? this.serviceDetail['availability']['endtime'] : '';
          var duration = this.serviceDetail && this.serviceDetail['duration'] ? this.serviceDetail['duration'] : '';

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
            this.alltimeslotLists.push(obj);
            time += parseInt(duration);
          }
                
          this.timeisLoadingBox = false;
          return;
        }
      }, (error) => {
        console.error(error);
        this.isLoading = false;
      });

  }

  async getAllAssets() {

    var url = "assets/filter"
    var method = "POST";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });
    postData["search"].push({ "searchfield": "customerid", "searchvalue": this.bindId, "criteria": "eq" });
    postData["search"].push({ "searchfield": "onCustomerModel", "searchvalue": "Member", "criteria": "eq" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          this.allAttendeeLists = data
          return;
        }
      }, (error) => {
        console.error(error);
      });
  }

  async getCalendarData() {

    var asssetLists = [];
    this.allAttendeeLists.forEach(element => {
      asssetLists.push(element._id);

    });

    var url = "appointments/filter"
    var method = "POST";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "attendee", "searchvalue": asssetLists, "criteria": "in" });
    postData["search"].push({ "searchfield": "onModel", "searchvalue": "Asset", "criteria": "eq" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          data.forEach(element => {
            element.title = element.attendee.title;
            element.date = element.appointmentdate;
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
      initialView: 'dayGridMonth',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: ''
      },
      selectable: true,
      weekends: true,
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
        if(info && info.event && info.event.extendedProps && info.event.extendedProps.property && info.event.extendedProps.property.onlinemeet && info.event.extendedProps.property.onlinemeet == true && info.event.extendedProps.property.onlinemeeturl && info.event.extendedProps.property.onlinemeeturl !== "") {
          var customTitleForMonth = info.event.title;
          $(info.el).find(".fc-sticky").html("<span>"+ customTitleForMonth +"</span><button> START NOW </button>");
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
    this._router.navigate(["pages/inspection-module/inspection"]);
  }

  async search(dateInfo: any) {
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

  onScheduleChanged(value) {

    if (value) {

      this.schedule = value;
      if(this.schedule == "custom" || this.schedule == "recurring") {
        this.disableBtn = true;
      } else {
        this.disableBtn = false;
      }

      this.appointmentscheduleList = [];
      var timeslotid = this.timeslotid.value ? this.timeslotid.value : this.timeslotid;
      if (this.schedule !== "onetime" && timeslotid == "") {
        this.showNotification('top', 'right', 'Timeslot cannot be empty!!', 'danger');
        return;
      }

      if (this.schedule == "recurring") {
        this.recurringtype = "daily";
        this.form.get('recurringtype').setValue("daily");
        this.form.get('recurringoccurance').setValue(2);
        this.recurringoccurance = 2;
      }
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
    if (this.date !== null) {
      this.appointmentscheduleList = [];
      var startDate = new Date(this.date);
      var endDate = new Date(this.enddate);

      if (this.schedule == "recurring") {
        if (this.recurringtype !== "") {
          if (this.recurringtype == "daily") {
            for (var i = 0; i < this.recurringoccurance; i++) {
              startDate = this.getNextDay(startDate);
              this.appointmentscheduleList.push(startDate);
            }
          } else if (this.recurringtype == "weekly") {
            for (var i = 0; i < this.recurringoccurance; i++) {
              startDate = this.getNextDayOfWeek(startDate, startDate.getDay())
              this.appointmentscheduleList.push(startDate);
            }
          } else if (this.recurringtype == "monthly") {
            for (var i = 0; i < this.recurringoccurance; i++) {
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

      } else if (this.schedule == "custom") {

        if(endDate == undefined) {
          this.showNotification('top', 'right', 'please select end date!!!', 'danger');
          return;
        }

        if(this.checked && this.checked.length == 0) {
          this.showNotification('top', 'right', 'please select days!!!', 'danger');
          return;
        }

        if ((endDate <= startDate)) {
          this.showNotification('top', 'right', 'End date should be greater than start date', 'danger');
          return;
        }

        if (this.checked && this.checked.length !== 0 && endDate !== undefined && endDate !== null) {
          while (startDate <= endDate) {
            var dayOBj = this.checked.find(p => p == this.getDayName(startDate));
            if (dayOBj) {
              this.appointmentscheduleList.push(new Date(startDate));
            }
            startDate = this.getNextDay(startDate);
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
          this.showNotification('top', 'right', 'Validation failed!!', 'danger');
          return;
        }
      }
    } else {
      this.showNotification('top', 'right', 'Start date cannot be empty!!!', 'danger');
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
      
      if (value.schedule !== 'onetime' && this.appointmentscheduleList && this.appointmentscheduleList.length == 0) {
        this.showNotification('top', 'right', 'Add timeslot', 'danger');
        return;
      }
      
     

      if (value.schedule == "onetime") {
        this._appointmentModel.appointmentdate = value.date._d ? value.date._d : value.date;
      } else {
        this._appointmentModel.appointmentdate = [];
        this._appointmentModel.appointmentdate = this.appointmentscheduleList;
      }

      this._appointmentModel.onModel = "Asset";
      this._appointmentModel.attendee = value.attendee.value._id;
      this._appointmentModel.refid = this.serviceDetail._id;
      this._appointmentModel.timeslot = value.timeslotid.value;
      this._appointmentModel.charges = this.serviceDetail.charges ? this.serviceDetail.charges : 0;
      this._appointmentModel.duration = this.serviceDetail.duration ? this.serviceDetail.duration : 0;

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
            
            this.attendee.setValue("")
            this.timeslotid.setValue("")
            

            this.form.reset();
            setTimeout(() => {
              this.onInspectionAssetData.emit("success");  
            }, 500);
            
          }
        }, (error) => {
          this.disableBtn = false;
          console.error(error);
        });

    }

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
  }

}
