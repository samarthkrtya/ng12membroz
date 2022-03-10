import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators , ValidatorFn, AbstractControl} from '@angular/forms';

import { of, Subject } from 'rxjs';
import { CommonService } from '../../core/services/common/common.service';
import { BaseLiteComponemntComponent } from '../base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

import { Observable } from 'rxjs';
import { map, startWith, takeUntil } from 'rxjs/operators';
import * as moment from 'moment';

import { MatRadioChange } from '@angular/material/radio';
import { MatSelectionListChange } from '@angular/material/list';


import { AppointmentModel } from '../../core/models/appointment/appointment.model';
import { FacilityBookingModel } from 'src/app/core/models/service/facilitybooking';


function autocompleteObjectValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    if (typeof control.value === 'string') {
      return { 'invalidAutocompleteObject': { value: control.value } }
    }
    return null  /* valid option selected */
  }
}

@Component({
  selector: 'app-facility-booking',
  templateUrl: './facility-booking.component.html',
  styles: [`
    ::ng-deep .mat-select-panel .mat-pseudo-checkbox {
      border: 2px solid !important
    }`]
})
export class FacilityBookingComponent extends BaseLiteComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();

  form: FormGroup;
  submitted: boolean;
  disableBtn: boolean = false;

  _facilitybookingModel = new FacilityBookingModel();


  _id: any;
  date: Date;

  facilityid = new FormControl();
  markingid: any;
  timeslotid = new FormControl();
  schedule: any;
  recurringtype: any;
  recurringoccurance: any;
  days: string[] = [];
  enddate: Date;
  fullname: any;
  charges: number;
  duration: number;
  mindate: Date = new Date();

  type_fields: any = {}


  attendee = new FormControl();
  attendeeoptions: string[] = [];
  filteredAttendeeOptions: Observable<string[]>;
  allAttendeeLists: any[] = [];
  attendeeisLoadingBox: boolean = false;

  serviceLists: any[] = [];
  filteredOptions: Observable<string[]>;
  isLoadingBox: boolean = false;

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

  AllserviceLists: any [] = [];


  @Input() dataContent: any;
  @Input() type: any;
  @Output() onBookingData = new EventEmitter();

  constructor(
    private _commonService: CommonService,
    private fb: FormBuilder,
    private _route: ActivatedRoute,
  ) {
    super()
    this.pagename = "app-appointment-add";
    this.form = fb.group({
      '_id': [this._id],
      'date': [this.date, Validators.required],
      'facilityid': [this.facilityid,  { validators: [autocompleteObjectValidator(), Validators.required] }],
      'markingid': [this.markingid, Validators.required],
      'attendee': [this.attendee, { validators: [autocompleteObjectValidator(), Validators.required] }],
      'timeslotid': [this.timeslotid,  { validators: [autocompleteObjectValidator(), Validators.required] }],
      'schedule': [this.schedule, Validators.required],
      'recurringtype': [this.recurringtype],
      'charges': [this.charges],
      'days': [this.days],
      'recurringoccurance': [this.recurringoccurance],
      'enddate': [this.enddate],
      'firstname': [this.fullname],
    });
  }

  public validation_msgs = {
    'facilityid': [
      { type: 'invalidAutocompleteObject', message: 'Facility name not recognized. Click one of the autocomplete options.' },
      { type: 'required', message: 'Facility is required.' }
    ],

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
      super.ngOnInit()
      await this.initializeVariables()
      if (this.type == "multi") {
        await this.getAllMembers()
      }
      await this.getAllServices()
    } catch (error) {
      console.error("error", error)
    } finally {
      if(this.dataContent && this.dataContent.actionValue && this.dataContent.actionValue == 'service') {

        console.log("AllserviceLists", this.AllserviceLists);
        console.log(this.dataContent.serviceid)

        if(this.dataContent.serviceid) {
          var serviceObj = this.AllserviceLists.find(p=>p._id == this.dataContent.serviceid);
          if(serviceObj) {
            this.type_fields["value"] = serviceObj.category._id ? serviceObj.category : undefined;

            this.facilityid.setValue(serviceObj);
            this.form.get("facilityid").setValue(this.facilityid);

            this.date = new Date()
            this.form.get("date").setValue(this.date);

            console.log("alltimeslotLists", this.alltimeslotLists)
          }


        }

        this.type_fields["visible"] = true;



      }
    }

    this.filteredOptions = this.facilityid.valueChanges
      .pipe(
        startWith(''),
        map(option => typeof option === 'string' ? option : option.title),
        map(option => option ? this._filter(option) : this.serviceLists.slice())
      );

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

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }

  async initializeVariables() {

    this.form.get("schedule").setValue("onetime");
    this.schedule = "onetime";
    this.recurringtype = "";
    this.allAttendeeLists = [];
    this.recurringoccurance = 8;
    this.recurringoccuranceLists = [];
    for (var i = 2; i < 52; i++) {
      this.recurringoccuranceLists.push(i);
    }
    this.appointmentscheduleList = [];


    this.attendee.setValue(null)
    this.facilityid.setValue(null)
    this.timeslotid.setValue(null)

    this.AllserviceLists = [];

    this.type_fields = {};

    var visible = true;
    if(this.dataContent && this.dataContent.actionValue && this.dataContent.actionValue == "service")
      visible = false;

    this.type_fields = {

      fieldname: "markingid",
      fieldtype: "formdata",
      search: [
        { searchfield: "status", searchvalue: "active", criteria: "eq" },
        { searchfield: "formid", searchvalue: "5e70cb9dd466f11d24a7c361", criteria: "eq" },
      ],
      formname: "facilitytype",
      form: {
        formfield: "_id",
        displayvalue: "property.name",
      },
      select: [
        { fieldname: "_id", value: 1 },
        { fieldname: "property.name", value: 1 },
        { fieldname: "property.image", value: 1 },
        { fieldname: "property.type", value: 1 },
      ],
      visible: visible

    }

    return;
  }

  private _filter(value: string): string[] {
    let results;
    if (value) {
      results = this.serviceLists
        .filter(option => {
          if (option.title) {
            return option.title.toLowerCase().indexOf(value.toLowerCase()) === 0
          } else {
            return;
          }
        });
      if (results.length < 1) {
        results = [];
      }
    } else {
      results = this.serviceLists.slice();
    }
    return results;
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

  inputModelChangeValue(value: any) {
    this.serviceLists = [];
    if (value && value.autocomplete_id) {
      this.markingid = value;
      this.getServiceLists();
    }
  }

  optionSelected(option: any) {
    this.facilityid.setValue(option.value);
    this.charges = this.facilityid.value.charges;
    this.duration = this.facilityid.value.duration;
  }

  async getAllServices() {
    var url = "assets/filter";
    var method = "POST";

    let postData = {};
    postData['search'] = [];
    postData['search'].push({ "searchfield": 'status', "searchvalue": "active", "criteria": "eq" });
    postData['search'].push({ "searchfield": 'bookingtype', "searchvalue": "HOURLY", "criteria": "eq" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          this.AllserviceLists = [];
          this.AllserviceLists = data;
          return;
        }
      }, (error) => {
        console.error(error);
      });
  }

  getServiceLists() {

    if (this.markingid && this.markingid.autocomplete_id) {

      this.isLoadingBox = true;

      var url = "assets/filter";
      var method = "POST";

      let postData = {};
      postData['search'] = [];
      postData['search'].push({ "searchfield": 'status', "searchvalue": "active", "criteria": "eq" });
      postData['search'].push({ "searchfield": 'category', "searchvalue": this.markingid.autocomplete_id, "criteria": "eq" });
      postData['search'].push({ "searchfield": 'bookingtype', "searchvalue": "HOURLY", "criteria": "eq" });

      this._commonService
        .commonServiceByUrlMethodData(url, method, postData)
        .pipe(takeUntil(this.destroy$))
        .subscribe((data: any) => {
          if (data) {
            this.serviceLists = [];
            this.serviceLists = data;
            this.isLoadingBox = false;
          }
        }, (error) => {
          console.error(error);
        });
    }
  }

  preloaddata() {
    if (this.serviceLists && this.serviceLists.length == 0) {
      this.getServiceLists();
    }
  }

  enter() {
    const controlValue = this.facilityid.value;
    this.facilityid.setValue(controlValue);
  }

  handleEmptyInput(event: any) {
    if (event.target.value === '') {
      this.facilityid.setValue("");
      this.serviceLists = [];
    }
  }

  displayFn(user: any): string {
    return user && user.title ? user.title : '';
  }

  displayHostFn(user: any): string {
    return user && user.fullname ? user.fullname : '';
  }


  getDayName(date: Date) {
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var d = new Date(date);
    return days[d.getDay()];
  }

  onBookingDateChanged(val: any) {
    if (val) {
      if (this.facilityid && !this.facilityid.value) {
        this.showNotification('top', 'right', 'Select facility first!!!', 'danger');
        return false;
      }

      this.date = val._d ? val._d : val;
      var istoday: boolean = false;
      var today = new Date();
      var selectedDay = this.getDayName(this.date);
      var facilityid = this.facilityid.value ? this.facilityid.value : this.facilityid;
      this.alltimeslotLists = [];
      this.timeisLoadingBox = true;

      if (!facilityid['availability']['days'].includes(selectedDay)) {
        this.showNotification('top', 'right', 'No facility available on this day.', 'danger');
        this.timeisLoadingBox = false;
        return false;
      }

      var starttime = facilityid['availability'].starttime;
      var endtime = facilityid['availability'].endtime;
      var duration = facilityid['duration'];

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
      this.timeslotfilteredOptions = of(this.alltimeslotLists);
      this.timeisLoadingBox = false;
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

  timeDisplayFn(time: any): string {
    return time && time.displaytext ? time.displaytext : '';
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

  onRecurringChanged(event: any) {
    this.recurringtype = event;
    this.appointmentscheduleList = [];
  }

  onRecurringOccuranceChanged(event: any) {
    this.recurringoccurance = event;
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

  updateChecked($event: MatSelectionListChange) {
    if ($event.option.selected) {
      this.checked.push($event.option.value);
    } else {
      var index = this.checked.indexOf($event.option.value);
      this.checked.splice(index, 1);
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


        if (this.checked && this.checked.length !== 0 && this.enddate !== undefined && this.enddate !== null) {
          while (startDate <= this.enddate) {
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

  onEndDateChanged(val: any) {

    if (val) {
      //this.form.get("enddate").setValue(val);
      this.enddate = val;

    }
  }

  onSubmit(value: any, isValid: boolean) {
    console.log(isValid, value);
    this.submitted = true;

    if (!isValid) {
      this.showNotification('top', 'right', 'Fill required fields !!', 'danger');
      return false;
    } else {

      if (value.schedule !== 'onetime' && this.appointmentscheduleList && this.appointmentscheduleList.length == 0) {
        this.showNotification('top', 'right', 'Add timeslot', 'danger');
        return;
      }
      if (this.type == "multi" && (!value.attendee || !value.attendee.value)) {
        this.showNotification('top', 'right', 'Please select attendee !!', 'danger');
        return;
      }

      if (value.schedule == "onetime") {
        this._facilitybookingModel.bookingdate = value.date._d ? value.date._d : value.date;
      } else {
        this._facilitybookingModel.bookingdate = [];
        this._facilitybookingModel.bookingdate = this.appointmentscheduleList;
      }
      this._facilitybookingModel.charges = this.charges;
      this._facilitybookingModel.onModel = "Member";
      this._facilitybookingModel.customerid = this.type == "multi" ? value.attendee.value._id : this.dataContent._id;
      this._facilitybookingModel.refid = value.facilityid.value._id;
      this._facilitybookingModel.timeslot = value.timeslotid.value;
      this._facilitybookingModel.property = {};
      this._facilitybookingModel.property['markingid'] = value.markingid._id;

      var url = "facilitybookings"
      var method = "POST";

      this.disableBtn = true;
      this._commonService
        .commonServiceByUrlMethodData(url, method, this._facilitybookingModel)
        .pipe(takeUntil(this.destroy$))
        .subscribe((data: any) => {
          if (data) {
            this.disableBtn = false;
            this.showNotification('top', 'right', 'Facility has been booked successfully', 'success');
            this.form.reset();
            this.attendee.setValue("")
            this.facilityid.setValue("")
            this.timeslotid.setValue("")
            this.onBookingData.emit("success");
          }
        }, (error) => {
          this.disableBtn = false;
          console.error(error);
        });
    }
  }

  cancel() {
    this.form.reset();
    this.facilityid = new FormControl();
    this.timeslotid = new FormControl();
    this.scheduleLists = [
      { id: "onetime", name: "One Time", checked: true },
      { id: "recurring", name: "Recurring", checked: false },
      { id: "custom", name: "Custom", checked: false },
    ];
    this.onScheduleChanged(this.scheduleLists[0].id);
    this.attendee = new FormControl();
    this.alltimeslotLists = [];
    this.onBookingData.emit("cancel");
  }

  async getAllMembers() {

    var url = "members/filter"
    var method = "POST";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          this.allAttendeeLists = [];
          this.allAttendeeLists = data
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
      this.getAllMembers()
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
}
