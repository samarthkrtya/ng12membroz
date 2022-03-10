import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';

import { BaseLiteComponemntComponent } from '../../../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';


import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import * as moment from 'moment';

import { CommonService } from '../../../../../../core/services/common/common.service';


import { MatRadioChange } from '@angular/material/radio';
import { MatSelectionListChange } from '@angular/material/list';

import { AppointmentModel } from '../../../../../../core/models/appointment/appointment.model';

declare var $: any;
import swal from 'sweetalert2';

function autocompleteObjectValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    if (typeof control.value === 'string') {
      return { 'invalidAutocompleteObject': { value: control.value } }
    }
    return null  /* valid option selected */
  }
}

@Component({
  selector: 'app-vehicle-booking-lists',
  templateUrl: './vehicle-booking-lists.component.html',
  styles: [
  ]
})
export class VehicleBookingListsComponent extends BaseLiteComponemntComponent implements OnInit {

  _appointmentModel = new AppointmentModel();

  @Input() dataContent: any;
  @Output() onBookingData = new EventEmitter();

  displayedColumns3: string[];
  dataSource3: any[] = [];

  destroy$: Subject<boolean> = new Subject<boolean>();

  @ViewChild(MatPaginator) paginator: MatPaginator;

  dataSource = new MatTableDataSource<Element>();

  _id: any;
  date: Date;
  timeslotid = new FormControl();
  schedule: any;
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


  form: FormGroup;
  submitted: boolean;
  disableBtn: boolean = false;

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


  hostid = new FormControl();
  hostoptions: string[] = [];
  filteredHostOptions: Observable<string[]>;
  allHostLists: any[] = [];
  hostisLoadingBox: boolean = false;

  serviceDetail: any = {};

  workinghours: any = {};
  holidayLists: any[] = [];

  selectedAppointmentDetails: any = {};

  userLists: any[] = [];

  constructor(
    private fb: FormBuilder,
    private _commonService: CommonService,
  ) {

    super()

    this.pagename = "app-vehicle-booking-lists";


    this.form = fb.group({
      '_id': [this._id],
      'date': [this.date, Validators.required],
      'timeslotid': [this.timeslotid, { validators: [autocompleteObjectValidator(), Validators.required] }],
      'schedule': [this.schedule, Validators.required],
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

  }

  async ngOnInit() {

    try {
      await super.ngOnInit();
      await this.initializeVariables()
      await this.loadBookingLists()
      await this.getServiceData()
      await this.getAllHost()
      await this.getAllHolidays()
    } catch (error) {
      console.error(error);
    } finally {

      this.timeslotfilteredOptions = this.timeslotid.valueChanges
        .pipe(
          startWith(''),
          map(option => typeof option === 'string' ? option : option.displaytext),
          map(option => option ? this._timefilter(option) : this.alltimeslotLists.slice())
        );


      this.filteredHostOptions = this.hostid.valueChanges
        .pipe(
          startWith(''),
          map(option => typeof option === 'string' ? option : option.fullname),
          map(option => option ? this._hostfilter(option) : this.allHostLists.slice())
        );
    }
  }


  myFilter = (d: Date): boolean => {

    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var dayName = days[new Date(d).getDay()];

    return this.isInArray(this.holidayLists, d) && this.workinghours.days.includes(dayName);
  }

  isInArray(array: any, value: Date) {
    var check = array.find(item => new Date(item.date).toDateString() == new Date(value).toDateString())
    if (check) {
      return false
    } else {
      return true
    }
  }

  ngAfterViewInit() {

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

  async getAllHost() {

    this.allHostLists = [];

    //console.log("serviceDetail", this.serviceDetail);

    if (this.userLists && this.userLists.length > 0) {
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

          var istoday: boolean = false;
          var today = new Date();
          var selectedDay = this.getDayName(this.date);

          var branch = this._authService.currentUser.user.branchid;
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

  async initializeVariables() {

    this.displayedColumns3 = [];
    this.displayedColumns3 = ['appointmentdate', 'day', 'starttime', 'endtime', 'advisor', 'status', 'action'];
    this.dataSource3 = [];



    this.disableBtn = false;
    this.height = 1350;
    this.slotDuration = "00:15:00";
    this.slotMinTime = "00:00:00";
    this.slotMaxTime = "24:00:00";
    this.date = new Date();

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
    this.workinghours = {};
    this.workinghours = this._loginUserBranch.workinghours;
    this.holidayLists = [];

    this.selectedAppointmentDetails = {};

    this.userLists = [];

    return;

  }

  async loadBookingLists() {

    if (this.dataContent && this.dataContent.bookings && this.dataContent.bookings.length > 0) {

      this.dataContent.bookings.forEach(element => {

        this.dataSource3.push({
          appointmentdate: element.appointmentdate,
          starttime: element.timeslot && element.timeslot.starttime ? element.timeslot.starttime : '---',
          endtime: element.timeslot && element.timeslot.endtime ? element.timeslot.endtime : '---',
          day: element.timeslot && element.timeslot.day ? element.timeslot.day : '---',
          _id: element._id,
          advisor: element && element._id && element._id.host && element._id.host.fullname ? element._id.host.fullname : element && element.host && element.host.fullname ? element.host.fullname : '---',
          status: element.status
        });
      });

      this.dataSource = new MatTableDataSource<Element>(this.dataSource3);
      this.dataSource.paginator = this.paginator;
    }
    return;
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
      this._appointmentModel.attendee = this.dataContent._id;
      this._appointmentModel.refid = this.serviceDetail._id;
      this._appointmentModel.timeslot = value.timeslotid.value;
      this._appointmentModel.charges = this.serviceDetail.charges ? this.serviceDetail.charges : 0;
      this._appointmentModel.duration = this.serviceDetail.duration ? this.serviceDetail.duration : 30;
      this._appointmentModel.host = value?.hostid?.value?._id;

      if (value._id) {

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
              this.selectedAppointmentDetails = {};
              this.timeslotid.setValue("")
              this.form.reset();
              this.ngOnInit();

              setTimeout(() => {
                this.onBookingData.emit("success");
              }, 1000);


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
              this.timeslotid.setValue("")
              this.form.reset();
              this.ngOnInit();

              setTimeout(() => {
                this.onBookingData.emit("success");
              }, 1000);

            }
          }, (error) => {
            this.disableBtn = false;
            console.error(error);
          });

      }




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

  onScheduleChanged(value) {

    if (value) {

      this.schedule = value;
      if (this.schedule == "custom" || this.schedule == "recurring") {
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
            if (this.appointmentscheduleList.length > 0) {
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

        if (endDate == undefined) {
          this.showNotification('top', 'right', 'please select end date!!!', 'danger');
          return;
        }

        if (this.checked && this.checked.length == 0) {
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
            if (this.appointmentscheduleList.length > 0) {
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


  appointmentStatus(element: any, type: any) {


    this.selectedAppointmentDetails = element;

    if (type == 'edit') {

      this.form.controls['_id'].setValue(this.selectedAppointmentDetails._id._id);

      this.form.controls['date'].setValue(new Date(this.selectedAppointmentDetails.appointmentdate));

      var timeslotobj = this.alltimeslotLists.find(p => p.starttime == this.selectedAppointmentDetails._id.timeslot.starttime && p.endtime == this.selectedAppointmentDetails._id.timeslot.endtime)
      if (timeslotobj) {
        this.timeslotid.setValue(timeslotobj)
      }

      this.form.controls['schedule'].setValue('onetime');

      if (this.selectedAppointmentDetails && this.selectedAppointmentDetails._id && this.selectedAppointmentDetails._id.host && this.selectedAppointmentDetails._id.host._id) {
        this.hostid.setValue(this.selectedAppointmentDetails._id.host);
      }

      $("#myModalVehicleBtn").click();

    } else if (type == 'inspection') {
      this._router.navigate(["pages/inspection-module/inspection/" + this.selectedAppointmentDetails._id._id]);
    } else {

      const varTemp = this;
      swal.fire({
        title: 'Are you sure?',
        text: 'You will not be able to recover this action!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: `Yes, ${type} it!`,
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

          var model = { 'status': type };

          return varTemp._commonService
            .commonServiceByUrlMethodDataAsync(url, method, model, varTemp.selectedAppointmentDetails._id._id)
            .then((data: any) => {
              if (data) {

                varTemp.ngOnInit();

                setTimeout(() => {
                  this.onBookingData.emit("success");
                }, 1000);
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

  Addbooking() {
    $("#myModalVehicleBtn").click();
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }

}
