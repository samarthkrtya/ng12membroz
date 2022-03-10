import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';

import { MatButtonToggleAppearance } from '@angular/material/button-toggle';


import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

//import * as moment from 'moment';
//const moment = require('moment');
import moment from 'moment-timezone';

import { CalendarOptions, DateSelectArg, EventClickArg, EventDropArg } from '@fullcalendar/angular'; // useful for typechecking
import { EventResizeDoneArg } from '@fullcalendar/interaction';

import { BaseComponemntComponent, BaseComponemntInterface } from '../../../../shared/base-componemnt/base-componemnt.component';

declare var $: any;
import swal from 'sweetalert2';
import { empty } from 'joi';


const misc: any = {
  navbar_menu_visible: 0,
  active_collapse: true,
  disabled_collapse_init: 0,
};

@Component({
  selector: 'app-appointment-booking-calendar',
  templateUrl: './appointment-booking-calendar.component.html',
  styles: [
    `
      /* ::ng-deep th.fc-col-header-cell.fc-resource {
        overflow-x: hidden;
    } */


     /* Loading Stuff Start */

/* Absolute Center Spinner */
.loading {
    position: fixed;
    z-index: 999;
    height: 2em;
    width: 2em;
    overflow: show;
    margin: auto;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
  }
  
  /* Transparent Overlay */
  .loading:before {
    content: '';
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
      background: radial-gradient(rgba(20, 20, 20,.8), rgba(0, 0, 0, .8));
  
    background: -webkit-radial-gradient(rgba(20, 20, 20,.8), rgba(0, 0, 0,.8));
  }
  
  /* :not(:required) hides these rules from IE9 and below */
  .loading:not(:required) {
    /* hide "loading..." text */
    font: 0/0 a;
    color: transparent;
    text-shadow: none;
    background-color: transparent;
    border: 0;
  }
  
  .loading:not(:required):after {
    content: '';
    display: block;
    font-size: 10px;
    width: 1em;
    height: 1em;
    margin-top: -0.5em;
    -webkit-animation: spinner 1500ms infinite linear;
    -moz-animation: spinner 1500ms infinite linear;
    -ms-animation: spinner 1500ms infinite linear;
    -o-animation: spinner 1500ms infinite linear;
    animation: spinner 1500ms infinite linear;
    border-radius: 0.5em;
    -webkit-box-shadow: rgba(255,255,255, 0.75) 1.5em 0 0 0, rgba(255,255,255, 0.75) 1.1em 1.1em 0 0, rgba(255,255,255, 0.75) 0 1.5em 0 0, rgba(255,255,255, 0.75) -1.1em 1.1em 0 0, rgba(255,255,255, 0.75) -1.5em 0 0 0, rgba(255,255,255, 0.75) -1.1em -1.1em 0 0, rgba(255,255,255, 0.75) 0 -1.5em 0 0, rgba(255,255,255, 0.75) 1.1em -1.1em 0 0;
  box-shadow: rgba(255,255,255, 0.75) 1.5em 0 0 0, rgba(255,255,255, 0.75) 1.1em 1.1em 0 0, rgba(255,255,255, 0.75) 0 1.5em 0 0, rgba(255,255,255, 0.75) -1.1em 1.1em 0 0, rgba(255,255,255, 0.75) -1.5em 0 0 0, rgba(255,255,255, 0.75) -1.1em -1.1em 0 0, rgba(255,255,255, 0.75) 0 -1.5em 0 0, rgba(255,255,255, 0.75) 1.1em -1.1em 0 0;
  }
  
  /* Animation */
  
  @-webkit-keyframes spinner {
    0% {
      -webkit-transform: rotate(0deg);
      -moz-transform: rotate(0deg);
      -ms-transform: rotate(0deg);
      -o-transform: rotate(0deg);
      transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
      -moz-transform: rotate(360deg);
      -ms-transform: rotate(360deg);
      -o-transform: rotate(360deg);
      transform: rotate(360deg);
    }
  }
  @-moz-keyframes spinner {
    0% {
      -webkit-transform: rotate(0deg);
      -moz-transform: rotate(0deg);
      -ms-transform: rotate(0deg);
      -o-transform: rotate(0deg);
      transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
      -moz-transform: rotate(360deg);
      -ms-transform: rotate(360deg);
      -o-transform: rotate(360deg);
      transform: rotate(360deg);
    }
  }
  @-o-keyframes spinner {
    0% {
      -webkit-transform: rotate(0deg);
      -moz-transform: rotate(0deg);
      -ms-transform: rotate(0deg);
      -o-transform: rotate(0deg);
      transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
      -moz-transform: rotate(360deg);
      -ms-transform: rotate(360deg);
      -o-transform: rotate(360deg);
      transform: rotate(360deg);
    }
  }
  @keyframes spinner {
    0% {
      -webkit-transform: rotate(0deg);
      -moz-transform: rotate(0deg);
      -ms-transform: rotate(0deg);
      -o-transform: rotate(0deg);
      transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
      -moz-transform: rotate(360deg);
      -ms-transform: rotate(360deg);
      -o-transform: rotate(360deg);
      transform: rotate(360deg);
    }
  }

  /* Loading Stuff End */

    ::ng-deep span.fc-col-header-cell-cushion {
      word-break: break-word
    }

    ::ng-deep .d-inline {
      display: inline-block !important
    }



    .modal-open {
      overflow: scroll;
    }

    .d-none-important {
      display: none !important;
    }

    ::ng-deep .fc .fc-non-business {
      background: hsla(0,0%, 50%,.7) !important;
    }

    `
  ]
})
export class AppointmentBookingCalendarComponent extends BaseComponemntComponent implements OnInit, BaseComponemntInterface {

  disabled = false;
  attendee: any;
  appearance: MatButtonToggleAppearance = 'standard';

  calendarOptions: CalendarOptions;

  destroy$: Subject<boolean> = new Subject<boolean>();

  serviceLists: any[] = [];
  staffLists: any[] = [];
  selectedStaff: any[] = [];
  selectedService: any[] = [];
  selectedStatus: any[] = [];

  appointmentLists: any[] = [];
  filterappointmentData: any[] = [];
  resources: any[] = [];
  events: any[] = [];
  actionValue: any;

  calendarVisibility: boolean = false;
  displayAddBtn: boolean = false;

  workingdays: string[]= [];
  slotDuration: string;
  slotMinTime: string;
  slotMaxTime: string;
  branchobj: any;
  height: number;

  staffFormGroup: FormGroup;
  serviceFormGroup: FormGroup;
  statusFormGroup: FormGroup;

  status: any [] = [];
  
  
  days : string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  date: Date;
  dataContent: any;

  showModal: boolean;

  selectedAppointment: any={};
  addAppointmnet: boolean;

  daysOfWeek: any [] = [];

  disableBtn: boolean = false;

  holidayLists: any [] = [];
  workinghours: any = {};

  dateInfo: any = {};

  index: number;

  nextNumber: number = 0;
  numbercount: number = 0;


  isLoadingInit: boolean = true;

  branchBusinessHours: any [] = [];

  selectInfo: any = {};
  isEdit: boolean = false;
  isReschedule: boolean = false;

  custombuttom: any = "Zoom In";

  initialView: any = 'resourceTimeGridDay';

  cancellationReasonLists: any [] = [];
  cancallationreason: any;

  productLists: any[] = [];
  productisLoadingBox: boolean;
  productFilteredOptions: Observable<string[]>;

  form: FormGroup;
  submitted: boolean;

  paymentForm: FormGroup;
  paymentSubmitted: boolean;


  _receiptnumberVisibility: boolean = false;
  _bankDetailsVisbility: boolean = false;
  _cardDetailsVisbility: boolean = false;
  submitVisibility: boolean = false;
  directMode: boolean = false;


  mode_fields = {
    "visible" : true,
    "fieldname": "mode",
    "fieldtype": "lookup",
    "search": [
      { "searchfield": "status", "searchvalue": "active", "criteria": "eq" },
      { "searchfield": "lookup", "searchvalue": "payment methods", "criteria": "eq" }
    ],
    "select": [
      { "fieldname": "_id", "value": 1 },
      { "fieldname": "data", "value": 1 },
    ],
    "value": "",
    "dbvalue": "",
  };

  bankname_fields = {
    "visible" : true,
    "fieldname": "bankname",
    "fieldtype": "lookup",
    "search": [
      { "searchfield": "status", "searchvalue": "active", "criteria": "eq" },
      { "searchfield": "lookup", "searchvalue": "bank", "criteria": "eq" }
    ],
    "select": [
      { "fieldname": "_id", "value": 1 },
      { "fieldname": "data", "value": 1 },
    ],
    "value": "",
    "dbvalue": "",
  };

  chequestatus_fields = {
    "visible" : true,
    "fieldname": "chqstatus",
    "fieldtype": "lookup",
    "search": [
      { "searchfield": "status", "searchvalue": "active", "criteria": "eq" },
      { "searchfield": "lookup", "searchvalue": "cheque status", "criteria": "eq" }
    ],
    "select": [
      { "fieldname": "_id", "value": 1 },
      { "fieldname": "data", "value": 1 },
    ],
    "value": "",
    "dbvalue": "",
  };

  paymentreceivedby_fields = {
    "fieldname": "paymentreceivedby",
    "fieldtype": "form",
    "search": [
      { "searchfield": "status", "searchvalue": "active", "criteria": "eq" },
    ],
    "select": [
      { "fieldname": "_id", "value": 1 },
      { "fieldname": "property", "value": 1 },
      { "fieldname": "fullname", "value": 1 }
    ],
    "form": {
      "apiurl": "users/filter",
      "formfield": "_id",
      "displayvalue": "fullname",
    },
    "modelValue": "",
    "visible": true
  };

  groupLists: any [] = [];

  groupForm: FormGroup;
  groupSubmitted: boolean;

  grouptitle: any;

  constructor(
    private fb: FormBuilder
  ) {
    super()
    this.pagename = "app-appointment-booking-calendar";

    this.form = fb.group({
      'product': [, Validators.required],
      'productquantity': [1, Validators.required]
    });

    this.paymentForm = fb.group({
      'mode': ['', Validators.compose([Validators.required])],
      'paymentdate': [ ,Validators.required],
      'paymentreceivedby': [''],
      'paidamount': [, Validators.compose([Validators.required, Validators.min(1)])],
      'chqnumber': [],
      'bankname': [''],
      'accountnumber': [],
      'chqdate': [],
      'chqstatus': [],
      'cardnumber': [],
      'tidnumber': [],
    }, {
      validator: this.validateCheque
    });

    this.groupForm = fb.group({
      'grouptitle': [this.grouptitle, { validators: [Validators.required] }],
    });


  }


  validateCheque(group: FormGroup) {
    let paymentMode = group.get('mode').value;
    let paymentModeFilter: any;

    let chqnumber = group.get('chqnumber');
    let bankname = group.get('bankname');
    let accountnumber = group.get('accountnumber');
    let cardnumber = group.get('cardnumber');
    let neftnumber = group.get('neftnumber');

    if (paymentMode && paymentMode.autocomplete_id) {
      paymentModeFilter = paymentMode.autocomplete_id;
    }

    if (paymentModeFilter == "CHEQUE") {
      chqnumber.setValidators([Validators.required]);
      bankname.setValidators([Validators.required]);
    } else if (paymentModeFilter == "CARD") {
      cardnumber.setValidators([Validators.required]);
    } else if (paymentModeFilter == "NEFT") {
      bankname.setValidators([Validators.required]);
      neftnumber.setValidators([Validators.required]);
    } else if (paymentModeFilter == "NACH") {
      bankname.setValidators([Validators.required]);
      accountnumber.setValidators([Validators.required]);
    } else {
      group.controls['cardnumber'].setValidators(null);
      group.controls['chqnumber'].setValidators(null);
      group.controls['bankname'].setValidators(null);
    }
  }

  inputModelChangeValue(value: any) {

    this._bankDetailsVisbility = false;
    this._cardDetailsVisbility = false;
    this._receiptnumberVisibility = false;

    if (value.autocomplete_id) {
      let valCheck = value.autocomplete_id;
      if (valCheck.toLowerCase() == 'cheque') {
        this._bankDetailsVisbility = true;
        this._cardDetailsVisbility = false;
        this._receiptnumberVisibility = false;
      } else if (valCheck.toLowerCase() == 'card') {
        this._bankDetailsVisbility = false;
        this._cardDetailsVisbility = true;
        this._receiptnumberVisibility = false;
      } else if (valCheck.toLowerCase() == 'cash') {
        this._receiptnumberVisibility = true;
      } else {
        this._cardDetailsVisbility = false;
        this._bankDetailsVisbility = false;
      }
    }
  }


  async ngOnInit() {
    try {

      this.disableBtn = true;

      this.staffFormGroup = new FormGroup({
        staff: new FormControl([])
      })

      this.staffFormGroup.valueChanges.subscribe(async res => {

        this.selectedStaff = [];
        this.selectedStaff = res.staff;
        await this.filter_AppointmentData(1)
        this.calendarVisibility = false;

        if(this.nextNumber > 0) {
          await this.getCalendarData()
        }
        
      })

      this.serviceFormGroup = new FormGroup({
        service: new FormControl([])
      })

      this.serviceFormGroup.valueChanges.subscribe(async res => {
        
        this.selectedService = [];
        this.selectedService = res.service;
        await this.filter_AppointmentData(1)
        this.calendarVisibility = false;

        if(this.nextNumber > 0) {
          await this.getCalendarData()
        }

      })

      this.statusFormGroup = new FormGroup({
        status: new FormControl([])
      })

      this.statusFormGroup.valueChanges.subscribe(async res => {
        this.selectedStatus = [];
        this.selectedStatus = res.status;
        await this.filter_AppointmentData(1)
        this.calendarVisibility = false;
        if(this.nextNumber > 0) {
          await this.getCalendarData()
        }
      })

      await super.ngOnInit()
      await this.initializeVariables()
      await this.LoadData()
      await this.getCancellationReason()
    } catch (error) {
      console.error(error)
    } finally {
      this.disableBtn = false;
    }

    
    this.productFilteredOptions = this.form.get('product').valueChanges
      .pipe(
        startWith(''),
        map(option => typeof option === 'string' ? option : option?.itemname),
        map(option => option ? this._filterProduct(option) : this.productLists.slice())
      );

  }

  ngOnDestroy() {
    this.zoomOut();
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
    
  }

  async LoadData() {
    try {
      await this.getServiceLists();
      await this.getStaffAvailability()
      await this.getAppointment();
      await this.getCalendarData();
      await this.getAllHolidays();
      await this.getProductLists();
    } catch (error) {
      console.error(error)
    }
  }

  Save() { }
  Update() { }
  Delete() { }
  ActionCall() { }

  async initializeVariables() {
    this.isLoadingInit = true;
    this.serviceLists = [];
    this.staffLists = [];
    this.appointmentLists = [];
    this.filterappointmentData = [];
    this.resources = [];
    this.events = [];
    this.daysOfWeek = [];
    this.calendarVisibility = false;
    this.actionValue = "staff";
    this.slotDuration = "00:15:00";
    this.slotMinTime = "00:00:00";
    this.slotMaxTime = "24:00:00";
    this.height = 1350;

    this.date = new Date();

    this.status = [];
    this.status.push({ id: 'requested', name: 'Requested' }); 
    this.status.push({ id: 'confirmed', name: 'Confirmed' }); 
    this.status.push({ id: 'checkinguest', name: 'CheckIn'});
    this.status.push({ id: 'checkout', name: 'Checkout' }); 
//    this.status.push({ id: 'cancel', name: 'Cancel' }); 
    this.status.push({ id: 'noshow', name: 'No Show'});    


    var branch  = this._authService.currentUser.user.branchid;
    this.branchobj  = this._authService.currentUser.user.branchid;

    if (branch['workinghours']['starttime']) {
      this.slotMinTime = branch['workinghours']['starttime'];
    }
    if (branch['workinghours']['endtime']) {
      this.slotMaxTime = branch['workinghours']['endtime'];
    }
    this.workingdays = [];
    if (branch['workinghours']['days']) {
      this.workingdays = branch['workinghours']['days'];

      this.workingdays.forEach(element => {

        if(element == "Sunday") {
          this.daysOfWeek.push(0);
        } else if(element == "Monday") {
          this.daysOfWeek.push(1);
        } else if(element == "Tuesday") {
          this.daysOfWeek.push(2);
        } else if(element == "Wednesday") {
          this.daysOfWeek.push(3);
        } else if(element == "Thursday") {
          this.daysOfWeek.push(4);
        } else if(element == "Friday") {
          this.daysOfWeek.push(5);
        } else if(element == "Saturday") {
          this.daysOfWeek.push(6);
        } else if(element == "Sunday") {
          this.daysOfWeek.push(7);
        }

      });
    }
    this.dataContent = {};

    this.displayAddBtn = false;
    var day = this.days[this.date.getDay()];
    if(this.workingdays.includes(day)){
      this.displayAddBtn = true;
    }

    this.addAppointmnet = false;

    this.holidayLists = [];


    this.workinghours = {};
    this.workinghours = branch.workinghours;

    this.dateInfo = {};
    this.index = 0;

    this.branchBusinessHours = [];
    
    if(branch['breaktime'] && branch['breaktime'].length > 0) {

      var length = branch['breaktime'].length;

      for (let i = 0; i < branch['breaktime'].length; i++) {

        var br = branch['breaktime'][i];
        
        if(i == 0) {
          var obj = {
            startTime: this.slotMinTime,
            endTime: br.starttime,
            daysOfWeek: this.daysOfWeek
          }
          this.branchBusinessHours.push(obj);

          var Secondobj = {
            startTime: br.endtime,
            endTime: "",
            daysOfWeek: this.daysOfWeek
          }
          this.branchBusinessHours.push(Secondobj);

        } else {
          var templength = this.branchBusinessHours.length - 1;
          this.branchBusinessHours[templength]["endTime"] = br.starttime;

          var thirdObj = {
            startTime: br.endtime,
            endTime: "",
            daysOfWeek: this.daysOfWeek
          }
          this.branchBusinessHours.push(thirdObj);

        }

        if(length -1  == i ) {
          var templength = this.branchBusinessHours.length - 1;
          this.branchBusinessHours[templength]["endTime"] = this.slotMaxTime;
        }

      }
    }

    if(this.branchBusinessHours.length == 0 ){
      let objglobal = {
        startTime: this.slotMinTime,
        endTime: this.slotMaxTime,
        daysOfWeek: this.daysOfWeek
      }
      this.branchBusinessHours.push(objglobal);
    }
    this.isEdit = false;
    this.isReschedule = false;

    this.cancellationReasonLists = [];
    this.cancallationreason = '';

    this.productLists = [];
    

    this.groupLists = [];

    return;
  }

  async getCancellationReason() {
    
    let method = "POST";
    let url = "lookups/filter";

    let postData = {};
    postData['search'] = [];
    postData['search'].push({ "searchfield": 'status', "searchvalue": "active", "criteria": "eq" });
    postData['search'].push({ "searchfield": 'lookup', "searchvalue": "cancellation reason", "criteria": "eq" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          
          if (data && data[0] && data[0]['data']) {
            this.cancellationReasonLists = [];
            this.cancellationReasonLists = data[0]['data'];
          }
          
          return;
        }
      }, (error) => {
        this.isLoadingInit = false;
        console.error(error);
      })

  }

  async getServiceLists() {

    this.isLoadingInit = true;

    let method = "POST";
    let url = "services/filter";

    let postData = {};
    postData['search'] = [];
    postData['search'].push({ "searchfield": 'status', "searchvalue": "active", "criteria": "eq" });

    postData['select'] = [];
    postData['select'].push({ "fieldname": "availability", "value": 1 });
    postData['select'].push({ "fieldname": "category", "value": 1 });
    postData['select'].push({ "fieldname": "charges", "value": 1 });
    postData['select'].push({ "fieldname": "duration", "value": 1 });
    postData['select'].push({ "fieldname": "staff.fullname", "value": 1 });
    postData['select'].push({ "fieldname": "staff.status", "value": 1 });
    postData['select'].push({ "fieldname": "staff.availability", "value": 1 });
    postData['select'].push({ "fieldname": "staff.breaktime", "value": 1 });

    postData['select'].push({ "fieldname": "supportstaff.fullname", "value": 1 });
    postData['select'].push({ "fieldname": "supportstaff.status", "value": 1 });
    postData['select'].push({ "fieldname": "supportstaff.availability", "value": 1 });
    postData['select'].push({ "fieldname": "supportstaff.breaktime", "value": 1 });
    
    postData['select'].push({ "fieldname": "title", "value": 1 });
    postData['select'].push({ "fieldname": "assets.title", "value": 1 });
    postData['select'].push({ "fieldname": "items.itemname", "value": 1 });
    postData['select'].push({ "fieldname": "rooms.title", "value": 1 });
    postData['select'].push({ "fieldname": "property", "value": 1 });
    

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          
          this.serviceLists = [];
          this.serviceLists = data;

          this.isLoadingInit = false;

          var viewAllEmployeeSchedules = this.globalfunctionpermissions.includes("View All Employee Schedules");
          
          this.serviceLists.forEach(element => {

            element.id = element._id;

            if (element && element.staff && element.staff.length !== 0) {
              element.staff.forEach(elementStaff => {
                
                if(elementStaff.status == "active") {

                  
                  elementStaff.id = elementStaff._id
                  elementStaff.title = elementStaff.fullname;
                  
                  var staffObj = this.staffLists.find(p => p.id == elementStaff.id);
                  if (!staffObj) {
                    if(!viewAllEmployeeSchedules) {
                      if(elementStaff.id == this._loginUserId) {
                        this.staffLists.push(elementStaff)
                      }
                    } else {
                      this.staffLists.push(elementStaff)
                    }
                    
                  }
                }

              });
            }
          });
          return;
        }
      }, (error) => {
        this.isLoadingInit = false;
        console.error(error);
      })
  }

  async getStaffAvailability() {


    var today = new Date(this.date);
    today.setHours(0, 0, 0, 0);

    var tommrrow = new Date(this.date);
    tommrrow.setDate(tommrrow.getDate() + 1);
    tommrrow.setHours(0, 0, 0, 0);

    var staffids = [];

    if(this.dateInfo?.view?.type == "dayGridMonth" || this.dateInfo?.view?.type == "timeGridWeek" && this.staffFormGroup.get('staff').value) {
      staffids = [...this.staffFormGroup.get('staff').value];
    } else {
      staffids = this.staffLists.map(choice => (choice._id));
    }
    
    var now = moment();
    var localOffset = now.tz(this.branchobj.timezone).utcOffset();

    var url = "analyticsreports/process";
    var method = "POST";

    let postData = {};
    postData['id'] = "619c87614220efd6edda0232"; 
    
    postData['search'] = [];
    postData['search'].push({ "searchfield": 'staffids', "searchvalue": staffids, "criteria": "in", "datatype": "ObjectId"});
    postData['search'].push({ "searchfield": 'startdate', "searchvalue": today, "criteria": "eq", "datatype": "date", "locationtime": true });
    postData['search'].push({ "searchfield": 'enddate', "searchvalue": tommrrow, "criteria": "eq", "datatype": "date", "locationtime": true });

    

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          
          
            this.date.setHours(0, 0, 0, 0)
            data.forEach(element => {
            var date = new Date(element.date);
            date.setUTCMinutes(date.getUTCMinutes() + localOffset)
            
            var analyticsObj = this.staffLists.find(p=> ((p._id == element._id) && (this.date.getDate() === new Date(date).getDate())));

            

            if(analyticsObj) {
  
              
              analyticsObj.bussinessHourStatus = false;
              analyticsObj.isnoavailable = element.isnoavailable;
              analyticsObj.isHoliday =  element.isHoliday;
              analyticsObj.isClosed = element.isClosed;

              if(element.availabilitycalendarid && element.availability && element.availability.length > 0) {
                
                analyticsObj.bussinessHourStatus = true;
                analyticsObj.businessHours = [];

                if(element['breaktime'] && element['breaktime'].length > 0) {

                  var slotMinTime = element.availability[0]["starttime"];
                  var slotMaxTime = element.availability[element.availability.length - 1]["endtime"];

                  var length = element['breaktime'].length;
            
                  for (let i = 0; i < element['breaktime'].length; i++) {
            
                    var br = element['breaktime'][i];
                    
                    if(i == 0) {
                      var obj = {
                        startTime: slotMinTime,
                        endTime: br.starttime,
                        daysOfWeek: this.daysOfWeek
                      }
                      analyticsObj.businessHours.push(obj);
            
                      var Secondobj = {
                        startTime: br.endtime,
                        endTime: "",
                        daysOfWeek: this.daysOfWeek
                      }
                      analyticsObj.businessHours.push(Secondobj);
            
                    } else {
                      var templength = analyticsObj.businessHours.length - 1;
                      analyticsObj.businessHours[templength]["endTime"] = br.starttime;
            
                      var thirdObj = {
                        startTime: br.endtime,
                        endTime: "",
                        daysOfWeek: this.daysOfWeek
                      }
                      analyticsObj.businessHours.push(thirdObj);
            
                    }
            
                    if(length -1  == i ) {
                      var templength = analyticsObj.businessHours.length - 1;
                      analyticsObj.businessHours[templength]["endTime"] = slotMaxTime;
                    }
            
                  }

                } else {
                                
                  element.availability.forEach(elementAva => {
                    let obj = {
                      daysOfWeek: [...this.daysOfWeek],
                      startTime: elementAva.starttime,
                      endTime: elementAva.endtime
                    }
                    analyticsObj.businessHours.push(obj)
                  });
                }
                
              } else if(element.isnoavailable || element.isHoliday || element.isClosed) {
                
                analyticsObj.isnoavailable = element.isnoavailable;
                analyticsObj.isHoliday =  element.isHoliday;
                analyticsObj.isClosed = element.isClosed;
                
                analyticsObj.bussinessHourStatus = true;
                analyticsObj.businessHours = [];

                let obj = {
                  daysOfWeek: [...this.daysOfWeek],
                  startTime: this.slotMinTime,
                  endTime:  this.slotMaxTime
                }
                analyticsObj.businessHours.push(obj)


                var day = this.date.getDay();
                const index = analyticsObj.businessHours[0].daysOfWeek.indexOf(day);

                if (index > -1) {
                  analyticsObj.businessHours[0].daysOfWeek.splice(index, 1);
                }

              } else if(analyticsObj && analyticsObj.availability && analyticsObj.availability.starttime && analyticsObj.availability.endtime) {
                
                analyticsObj.bussinessHourStatus = true;
                analyticsObj.businessHours = [];
                var daysOfWeek = [];
                
                if(analyticsObj.availability.days && analyticsObj.availability.days.length > 0) {

                  
                  analyticsObj.availability.days.forEach(elementDay => {

                    if(elementDay == "Sunday") {
                      daysOfWeek.push(0);
                    } else if(elementDay == "Monday") {
                      daysOfWeek.push(1);
                    } else if(elementDay == "Tuesday") {
                      daysOfWeek.push(2);
                    } else if(elementDay == "Wednesday") {
                      daysOfWeek.push(3);
                    } else if(elementDay == "Thursday") {
                      daysOfWeek.push(4);
                    } else if(elementDay == "Friday") {
                      daysOfWeek.push(5);
                    } else if(elementDay == "Saturday") {
                      daysOfWeek.push(6);
                    }
            
                  });

                  var day = this.date.getDay();
                  const index = daysOfWeek.indexOf(day);
                  if (index == -1) {
                    analyticsObj.isnoavailable = true;
                  }
                }

                if(analyticsObj['breaktime'] && analyticsObj['breaktime'].length > 0) {

                  var slotMinTime = analyticsObj.availability["starttime"];
                  var slotMaxTime = analyticsObj.availability["endtime"];

                  
                  var length = analyticsObj['breaktime'].length;
            
                  for (let i = 0; i < analyticsObj['breaktime'].length; i++) {
            
                    var br = analyticsObj['breaktime'][i];
                    
                    if(i == 0) {
                      var obj = {
                        startTime: slotMinTime,
                        endTime: br.starttime,
                        daysOfWeek: daysOfWeek
                      }
                      analyticsObj.businessHours.push(obj);
            
                      var Secondobj = {
                        startTime: br.endtime,
                        endTime: "",
                        daysOfWeek: daysOfWeek
                      }
                      analyticsObj.businessHours.push(Secondobj);
            
                    } else {
                      var templength = analyticsObj.businessHours.length - 1;
                      analyticsObj.businessHours[templength]["endTime"] = br.starttime;
            
                      var thirdObj = {
                        startTime: br.endtime,
                        endTime: "",
                        daysOfWeek: daysOfWeek
                      }
                      analyticsObj.businessHours.push(thirdObj);
            
                    }
            
                    if(length -1  == i ) {
                      var templength = analyticsObj.businessHours.length - 1;
                      analyticsObj.businessHours[templength]["endTime"] = slotMaxTime;
                    }
            
                  }
                } else {
                  
                  let obj = {
                    daysOfWeek: daysOfWeek.length > 0 ? [...daysOfWeek] : [...this.daysOfWeek],
                    startTime: analyticsObj.availability.starttime,
                    endTime: analyticsObj.availability.endtime
                  };                  
                  analyticsObj.businessHours.push(obj)
                  
                }

                

              }
            }
            
          });
          return;
        }
      }, (error) => {
        console.error(error);
      });
  }

  addAppointment() {
    this.selectInfo = {};
    this.addAppointmnet = true;
    $("#myModalAppointmentBtn").click();

    var $body = $(document.body);
    $body.width(0);

  }

  async getAppointment() {

    let method = "POST";
    let url = "appointments/filter";

    var sdate = new Date(this.date);
    
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": ["deleted", "cancel"], "criteria": "nin" });
    postData["search"].push({ "searchfield": "host", "searchvalue": true, "criteria": "exists", "datatype": "boolean" });

    if(this.dateInfo?.view?.type == "dayGridMonth" || this.dateInfo?.view?.type == "timeGridWeek") {
      var firstDay = new Date(this.dateInfo.startStr);
      var lastDay = new Date(this.dateInfo.endStr);
      postData["search"].push({ "searchfield": "appointmentdate", "searchvalue": { "$gte": firstDay, "$lt": lastDay }, "criteria": "eq", "datatype": "Date", "locationtime": true });
    } else {
      postData["search"].push({ "searchfield": "appointmentdate", "searchvalue": sdate, "criteria": "fullday", "datatype": "Date" });
    }

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          this.appointmentLists = data;
          this.filterappointmentData = [...data];
          return;
        }
      }, (error) => {
        console.error(error);
      });
  }

  async filter_AppointmentData(params: any) {


    if(this.appointmentLists && this.appointmentLists.length > 0) {

      this.filterappointmentData = [];
      this.appointmentLists.forEach(element => {

        var statusExists: boolean = false;
        var staffExists: boolean = false;
        var serviceExists: boolean = false;

        if(this.statusFormGroup.value.status && this.statusFormGroup.value.status.length > 0) {
          var statusObj = this.statusFormGroup.value.status.find(p=>p == element.status);
          if(statusObj) {
            statusExists = true;
          }
        }

        if(this.serviceFormGroup.value.service && this.serviceFormGroup.value.service.length > 0) {
          var serviceObj = this.serviceFormGroup.value.service.find(p=>p == element.refid._id);
          if(serviceObj) {
            serviceExists = true;
          }
        }

        if(this.staffFormGroup.value.staff && this.staffFormGroup.value.staff.length > 0) {
          var staffObj = this.staffFormGroup.value.staff.find(p=>p == element.host._id);
          if(staffObj) {
            staffExists = true;
          }
        }

        if(statusExists && staffExists && serviceExists) {
          this.filterappointmentData.push(element);
        }

      });

      setTimeout(async () => {
        if(params == 1)  {
          await this.getCalendarData();
        }
      });
    }
  }

  checkStaffAva = (elementStaff: any): boolean => {

    if(elementStaff.isnoavailable || elementStaff.isHoliday || elementStaff.isClosed) {
      if(this.filterappointmentData && this.filterappointmentData.length > 0) {
        var app = this.filterappointmentData.find(p=>{                 
          return p.host && (p.host._id == elementStaff.id || (p.property && p.property.supportstaff && p.property.supportstaff.length > 0 && p.property.supportstaff[0] == elementStaff.id))
        });        
        if(app) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    } else {
      return true;
    }
  }

  async getCalendarData() {

    this.events = [];
    this.resources = [];

    if (this.actionValue == "staff") {
      this.selectedStaff.forEach(element => {
        this.staffLists.forEach(elementStaff => {

          

          if (elementStaff.id == element && this.checkStaffAva(elementStaff)) {

            if(elementStaff.bussinessHourStatus == false)  {
              elementStaff.businessHours = [];
              elementStaff.businessHours =  [...this.branchBusinessHours]
            }

            if(this._loginUserBranch && this._loginUserBranch.appointmentsetting && this._loginUserBranch.appointmentsetting.allowAppointmentInThepast && this._loginUserBranch.appointmentsetting.allowAppointmentInThepast == "Yes") {
              
            } else {
              elementStaff.eventConstraint ="businessHours";
            }

            this.resources.push(elementStaff);
          }
        });
      });
      
    } else {
      this.selectedService.forEach(element => {
        this.serviceLists.forEach(elementService => {
          if (elementService.id == element) {
            this.resources.push(elementService);
          }
        });
      });
      
    }

    this.events = [...this.filterappointmentData];

    this.groupLists = [];
    
    for (let i = 0; i < this.events.length; i++) {

      
      var element = this.events[i];

      element.id = element._id;

      if (this.actionValue == "staff") {
        element.resourceIds = [];
        element.resourceIds.push(element?.host?._id);

        if(element["property"] && element["property"]["supportstaff"] && element["property"]["supportstaff"].length > 0) {
          element["property"]["supportstaff"].forEach(elementsupportstaff => {
            element.resourceIds.push(elementsupportstaff);
          });
        }

        var hostString = "";
        // if(element && element.host && element.host.fullname) {
        //   hostString = " | " + element?.host?.fullname;
        // }

        element.title =  element?.refid?.title + hostString;
        
      } else {
        element.resourceIds = [];
        element.resourceIds.push(element?.refid?._id);

        if(element["property"] && element["property"]["supportstaff"] && element["property"]["supportstaff"].length > 0) {
          element["property"]["supportstaff"].forEach(elementsupportstaff => {
            element.resourceIds.push(elementsupportstaff);
          });
        }

        var serviceString = "";
        // if(element && element.refid && element.refid.title) {
        //   serviceString = " | " + element?.refid?.title;
        // }

        element.title = element?.host?.fullname + serviceString;
        
      }


      if(element && element.property && element.property.group) {

        var groupOBj = this.groupLists.find(p=>p.id == element.property.group.id);
        if(!groupOBj) {
          this.groupLists.push(element.property.group);
        }
        
      }
      
      element.memberprofilepic = element && element.attendee && element.attendee.profilepic ? element.attendee.profilepic : './assets/img/default-avatar.png';

      var start = new Date(element.appointmentdate);
      var now = moment();
      var localOffset = now.tz(this.branchobj.timezone).utcOffset();
      start.setMinutes(start.getMinutes() + localOffset);
      var startTime = element.timeslot.starttime.split(":");
      start.setHours(startTime[0]);
      start.setMinutes(startTime[1]);

      var end = new Date(element.appointmentdate);
      var now = moment();
      var localOffset = now.tz(this.branchobj.timezone).utcOffset();
      end.setMinutes(end.getMinutes() + localOffset);
      var endTime = element.timeslot.endtime.split(":");
      end.setHours(endTime[0]);
      end.setMinutes(endTime[1]);

      element.start = start;
      element.end = end;

      element.allDay = false

      

      if (element.status == "noshow") {
        element.color = '#f57c00';
        element.eventColor = '#f57c00';
       // element.editable = false;
      } else if (element.status == "cancel") {
        element.color = '#FB3E39';
        element.eventColor = '#FB3E39';
        //element.editable = false;
      } else if (element.status == "requested") {
        element.color = '#3D58D4';
        element.eventColor = '#3D58D4';
      } else if (element.status == "confirmed") {
        element.color = '#E152BF';
        element.eventColor = '#E152BF';
      } else if (element.status == "checkout") {
        element.color = '#47CCBF';
        element.eventColor = '#47CCBF';
        //element.editable = false;
      } else if (element.status == "checkinguest") {
        element.color = '#008000';
        element.eventColor = '#008000';
        element.editable = false;
        element.resourceEditable = false;
      } else {
        element.editable = true;
      }
    };

    if(this.slotMinTime && this.slotMaxTime && this.date) {

      var startminutes = 60;
      var endminutes = 60;

      if(this._loginUserBranch && this._loginUserBranch.appointmentsetting && this._loginUserBranch.appointmentsetting.allowAppointmentsToEndAfterYourLocationOfficalClosingTime == "Yes" && this._loginUserBranch.appointmentsetting.overageduration) {
        var hours = Number(this._loginUserBranch.appointmentsetting.overageduration);
        endminutes = Math.floor(hours * 60);
        
      }

      const newstarttime = moment(this.slotMinTime, 'HH:mm:ss').subtract(startminutes, 'minutes').format('HH:mm:ss');
      const newendtime = moment(this.slotMaxTime, 'HH:mm:ss').add(endminutes, 'minutes').format('HH:mm:ss');

      this.calendarVisibility = true;

      if(document.getElementsByClassName("fc-myCustomButton-button") && document.getElementsByClassName("fc-myCustomButton-button")[0]) {
        document.getElementsByClassName("fc-myCustomButton-button")[0].innerHTML = "";
      }

      this.calendarOptions = {

        loading: (isLoading) => {
        },

        customButtons: {
          myCustomButton: {
            text: this.custombuttom,
            click: this.customButtonSelect.bind(this)
          }
        },
        
        initialView: this.initialView,
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'myCustomButton resourceTimeGridDay, timeGridWeek, dayGridMonth'
        },
        selectable: true,
        weekends: true,
        resources: this.resources,
        events: this.events,
        
        schedulerLicenseKey: 'CC-Attribution-NonCommercial-NoDerivatives',
        height: this.height,
        allDaySlot: false,
        slotDuration: this.slotDuration,

        //slotMinTime: "00:00:00",
        //slotMaxTime: "24:00:00",
        
        slotMinTime: newstarttime,
        slotMaxTime: newendtime,

        scrollTime: this.slotMinTime,
        //scrollTime: "10:00:00",
        
        initialDate: this.date,
        selectConstraint: "businessHours",

        editable: true,
        eventDisplay: 'block',
        eventResourceEditable: true,
        dayMaxEvents: true, // when too many events in a day, show the popover

        views: {
          resourceTimeGridFourDay: {
            type: 'resourceTimeGrid',
            duration: { days: 4 },
            buttonText: '4 days'
          },
          day: {
            titleFormat: {
              year: 'numeric', 
              month: 'long', 
              day: 'numeric', 
              weekday: 'short'
            },
          },
          
        },

        // eventConstraint: {
          
        //   start: moment().format('YYYY-MM-DD'),
        //   end: '2100-01-01' // hard coded goodness unfortunately
        // },

        select: this.handleDateSelect.bind(this),
        eventClick: this.handleEventClick.bind(this),
        // eventResize: this.handleEventResize.bind(this),
        eventDidMount: function(info) {
          
          if(info && info.event && info.event.extendedProps && info.event.extendedProps.property && info.event.extendedProps.property.islock && info.event.extendedProps.property.islock == true) {
            $(info.el).find(".fc-event-time").prepend("<mat-icon class='mat-icon material-icons font-16 mr-1 float-right'>lock</mat-icon>");
          }

          if(info && info.event && info.event.extendedProps && info.event.extendedProps.property && info.event.extendedProps.property.note && info.event.extendedProps.property.note !== "") {
            $(info.el).find(".fc-event-time").prepend("<mat-icon class='mat-icon material-icons font-16 mr-1 float-right'>comment</mat-icon>");
          }

          if(info && info.event && info.event.extendedProps && info.event.extendedProps.packageid && info.event.extendedProps.packageid._id) {
            $(info.el).find(".fc-event-time").prepend("<mat-icon class='mat-icon material-icons font-16 mr-1 float-right'>link</mat-icon>");
          }

          if(info && info.event && info.event.extendedProps && info.event.extendedProps.property && info.event.extendedProps.property.group && info.event.extendedProps.property.group.id) {
            $(info.el).find(".fc-event-time").prepend("<mat-icon class='mat-icon material-icons font-16 mr-1 float-right'>groups</mat-icon>");
          }
          if(info && info.event && info.event.extendedProps && info.event.extendedProps.attendee && info.event.extendedProps.attendee.stage && info.event.extendedProps.attendee.stage=='NEW') {
            $(info.el).find(".fc-event-time").prepend("<mat-icon class='mat-icon material-icons font-16 mr-1 float-right' style='color:yellow'>fiber_new</mat-icon>");
          }
          

          if(info && info.event && info.event.extendedProps && info.event.extendedProps.attendee && info.event.extendedProps.attendee.fullname) {
            var attendee = info.event.extendedProps.attendee.fullname;
            $(info.el).find(".fc-sticky").append("<br><span>"+attendee+"</span>");
          }

          if(info && info.event && info.event.extendedProps && info.event.extendedProps.resourceids && info.event.extendedProps.resourceids.length > 0) {
            var roomObj =  info.event.extendedProps.resourceids.find(p=>p.onModel == 'Asset' && p.id.category == "61cd41ca53332318c84b5d6c");
            if(roomObj) {
              $(info.el).find(".fc-sticky").append("<br><span>"+roomObj.id.title+"</span>");
            }
          }
        },
        eventMouseEnter: eventEnter => {
          //console.warn("eventMouseEnter called");
        },
        eventMouseLeave: eventLeave => {
          //console.warn("eventMouseLeave called");
        },
        eventDrop: eventDrop => {
          this.handleEventDrop(eventDrop); // Call custom code
        },
        eventResize: eventResize => {
          this.handleEventResize(eventResize);
        },
        datesSet: (dateInfo) => {
          //console.warn("called", dateInfo)
          this.search(dateInfo); // Call custom code
        },
        
      };

      

      if(this._loginUserBranch && this._loginUserBranch.appointmentsetting && this._loginUserBranch.appointmentsetting.allowResourceOverbooking && this._loginUserBranch.appointmentsetting.allowResourceOverbooking == "Yes") {

      } else {
        this.calendarOptions.eventOverlap = false;
      }

      if(this._loginUserBranch && this._loginUserBranch.appointmentsetting && this._loginUserBranch.appointmentsetting.allowAppointmentInThepast && this._loginUserBranch.appointmentsetting.allowAppointmentInThepast == "Yes") {
              
      } else {
        this.calendarOptions.eventConstraint = {
          start: moment().format('YYYY-MM-DD'),
          end: '2100-01-01' // hard coded goodness unfortunately
        };
      }
      
      this.calendarVisibility = true;

    }

    this.nextNumber++;

    return;
  }

  customButtonSelect() {
    if (misc.sidebar_mini_active === true) {
      this.zoomOut();
    } else {
      this.zoomIn()
    }
  }

  zoomOut() {
    const newbody = document.getElementsByTagName('body')[0];
    newbody.classList.remove('sidebar-mini');
    misc.sidebar_mini_active = false;

    if(document.getElementsByClassName("fc-myCustomButton-button") && document.getElementsByClassName("fc-myCustomButton-button")[0]) {
      document.getElementsByClassName("fc-myCustomButton-button")[0].innerHTML = "Zoom In";
      this.custombuttom = "Zoom In";
    }

    $("#headercustom").removeClass("d-none-important");
    $("#labellists").removeClass("d-none-important");
    $("#functionlists").removeClass("d-none-important");

    // we simulate the window Resize so the charts will get updated in realtime.
    const simulateWindowResize = setInterval(function () {
      window.dispatchEvent(new Event('resize'));
    }, 180);

    // we stop the simulation of Window Resize after the animations are completed
    setTimeout(function () {
      clearInterval(simulateWindowResize);
    }, 1000);

  }

  zoomIn() {
    const newbody = document.getElementsByTagName('body')[0];
    setTimeout(function () {
      newbody.classList.add('sidebar-mini');
        misc.sidebar_mini_active = true;
    }, 300);

    if(document.getElementsByClassName("fc-myCustomButton-button")) {
      document.getElementsByClassName("fc-myCustomButton-button")[0].innerHTML = "Zoom Out";
      this.custombuttom = "Zoom Out";
    }
    $("#headercustom").addClass("d-none-important");
    $("#labellists").addClass("d-none-important");
    $("#functionlists").addClass("d-none-important");

    // we simulate the window Resize so the charts will get updated in realtime.
    const simulateWindowResize = setInterval(function () {
      window.dispatchEvent(new Event('resize'));
    }, 180);

    // we stop the simulation of Window Resize after the animations are completed
    setTimeout(function () {
      clearInterval(simulateWindowResize);
    }, 1000);
  }

  async search(dateInfo: any) {

    

    this.dateInfo = {};
    this.dateInfo = dateInfo;

    if(this.index !== 0) {
      try {
        
        if(dateInfo && dateInfo.view && dateInfo.view.type && (dateInfo.view.type == "timeGridWeek" || dateInfo.view.type == "dayGridMonth")) {
          this.date = new Date()
        } else {
          this.date = new Date(dateInfo.start)
        }
        
        await this.getStaffAvailability()
        await this.getAppointment();
        await this.filter_AppointmentData(0);
        await this.getCalendarData()
      } catch(error) {
        console.error(error)
      } finally {
      }
    } else if (this.index == 0) {
      this.index++
    }
    
    
  }

  async action(item: any) {

    this.calendarVisibility = false;
    this.actionValue = item;
    await this.getCalendarData()
  }

  cancel() {

    this.addAppointmnet = false;
    this.isEdit = false;
    this.isReschedule = false;
    this.selectedAppointment = {};
    this.selectInfo = {};

    var $body = $(document.body);
    $body.width("auto");

  }

  dateChange(date: any) {
    this.date = date._d ? date._d : date;
    this.calendarVisibility = false;
    this.LoadData();
    this.displayAddBtn = false;
    var day = this.days[this.date.getDay()];
    if(this.workingdays.includes(day)){
      this.displayAddBtn = true;
    }
  }

  getSubmittedData(submitData: any) {

    $("#appointmentClose").click();
    this.addAppointmnet = false;
    this.calendarVisibility = false;
    this.dataContent = {};
    this.isEdit = false;
    this.isReschedule = false;
    this.selectedAppointment = {};
    this.LoadData();

    var $body = $(document.body);
    $body.width("auto");

  }

  eventClick(event: any) {
    
  }

  handleDateSelect(selectInfo: DateSelectArg) {
    
    this.selectInfo = {};
    this.selectInfo = selectInfo;
    this.selectInfo.setdata = true;
    this.addAppointmnet = true;
    $("#myModalAppointmentBtn").click();

    var $body = $(document.body);
    $body.width(0);
    
  }

  handleEventClick(clickInfo: EventClickArg) {

    console.log(clickInfo)

    this.selectedAppointment = {};
    var appointmentObj = this.appointmentLists.find(p => p._id == clickInfo.event.id)
    if (appointmentObj) {

      this.selectedAppointment = appointmentObj;
      console.log(this.selectedAppointment)
      this.selectedAppointment['attendeename'] = appointmentObj.attendee.fullname?appointmentObj.attendee.fullname:appointmentObj.attendee.title;      
      
      if (this.selectedAppointment.onModel=="Groupclass"){
        this.selectedAppointment['numbercount'] = appointmentObj.attendee.members.length;
        this.selectedAppointment['capacity'] =  appointmentObj.attendee.property?.bookingperson
      }
      if(this.selectedAppointment.resourceids && this.selectedAppointment.resourceids.length > 0) {
        this.selectedAppointment.productLists = [];
        this.selectedAppointment.resourceids.forEach(elementResource => {
          if(elementResource.product) {
            this.selectedAppointment.productLists.push(elementResource);
          }
        });
      }
      
      

      this.selectedAppointment.title = clickInfo.event.title;
      this.showModal = true;
      
    }
  }

  handleEventDrop(eventDropInfo: EventDropArg) {

    this.initialView = eventDropInfo.view.type;

    if(this.initialView == "dayGridMonth") {
      this.date = new Date();
      var now = moment();
      var localOffset = now.tz(this.branchobj.timezone).utcOffset();
      this.date.setUTCHours(0, 0, 0, 0)    
      this.date.setUTCMinutes(this.date.getUTCMinutes() - localOffset)
    }
    
    let eventstarttime = eventDropInfo.event.start;
    let eventendtime = eventDropInfo.event.end;

    let date = new Date(eventDropInfo.event.start);
    var now = moment();
    var localOffset = now.tz(this.branchobj.timezone).utcOffset();
    date.setUTCHours(0, 0, 0, 0)    
    date.setUTCMinutes(date.getUTCMinutes() - localOffset)
    let starttime = moment(eventstarttime).format("HH:mm");
    let endtime = moment(eventendtime).format("HH:mm");

    let appointmentDetails = eventDropInfo.event._def.extendedProps;

    let timeslot: {};
    timeslot = {...appointmentDetails.timeslot};
    timeslot["starttime"] = starttime;
    timeslot["endtime"] = endtime;

    let postData = {};
    postData['appointmentdate'] = date;
    postData["id"] = appointmentDetails._id;

    if(eventDropInfo && eventDropInfo.newResource) {
      var oldResourceid = eventDropInfo.oldResource._resource.id;
      var newResourceid = eventDropInfo.newResource._resource.id;
      if(appointmentDetails && appointmentDetails.host && appointmentDetails.host._id == oldResourceid) {

        postData["host"] = newResourceid;

        if(appointmentDetails && appointmentDetails.refid && appointmentDetails.refid.staff && appointmentDetails.refid.staff.length > 0) {
          var staffObj = appointmentDetails.refid.staff.find(p=>p._id == newResourceid);
          if(!staffObj) {
            eventDropInfo.revert();
            return;
          }
        }
      } 

      if(appointmentDetails && appointmentDetails.property && appointmentDetails.property.supportstaff && appointmentDetails.property.supportstaff.length > 0) {

        var supportStaffObj = appointmentDetails.property.supportstaff.find(p=>p==oldResourceid);
        if(supportStaffObj) {

          postData["property"] = {};
          postData["property"] = {...appointmentDetails.property};
          postData["property"]["supportstaff"] = [];
          
          var supportStaff = [...appointmentDetails.property.supportstaff];
          var index = supportStaff.indexOf(oldResourceid);
          if (index !== -1) {
            supportStaff[index] = newResourceid;
          }

          postData["property"]["supportstaff"] = supportStaff;

          if(appointmentDetails && appointmentDetails.refid && appointmentDetails.refid.supportstaff && appointmentDetails.refid.supportstaff.length > 0) {
            var staffObj = appointmentDetails.refid.supportstaff.find(p=>p._id == newResourceid);
            if(!staffObj) {
              eventDropInfo.revert();
              return;
            }
          }
        }
      }
    }
    
    postData["timeslot"] = timeslot;

    if(appointmentDetails && appointmentDetails.property && appointmentDetails.property.islock) {
      eventDropInfo.revert();
      return;
    } else {
      //if(appointmentDetails.status == "requested" || appointmentDetails.status == "confirmed" || appointmentDetails.status == "checkinguest") {
      this.updateAppointment(postData);
      return;
    }
  }

  handleEventResize(eventResize: EventResizeDoneArg) {

    let eventstarttime = eventResize.event.start;
    let eventendtime = eventResize.event.end;

    let starttime = moment(eventstarttime).format("HH:mm");
    let endtime = moment(eventendtime).format("HH:mm");

    let appointmentDetails = eventResize.event._def.extendedProps;

    let timeslot: {};
    timeslot = {...appointmentDetails.timeslot};
    timeslot["starttime"] = starttime;
    timeslot["endtime"] = endtime;

    let postData = {};

    postData["id"] = appointmentDetails._id;
    postData["timeslot"] = timeslot;

    if(appointmentDetails && appointmentDetails.property && appointmentDetails.property.islock) {
      eventResize.revert();
      return;
    } else { //if(appointmentDetails.status == "requested" || appointmentDetails.status == "confirmed" || appointmentDetails.status == "checkinguest") {
      this.updateAppointment(postData);
      return;
    } 
  }

  hide() {
    this.showModal = false;
    this.selectInfo = {};
    this.selectedAppointment = {};
    this.isEdit = false;
    this.isReschedule = false;
  }

  checkout(action: any) {


    if(this.selectedAppointment && this.selectedAppointment.packageid && this.selectedAppointment.packageid._id) {
      var linkid = this.selectedAppointment.property['linkid'];
      this._router.navigate(["/pages/appointment-module/frontdesk/appointment/package/" + linkid]);
    } else {
      this._router.navigate(["/pages/appointment-module/frontdesk/" + this.selectedAppointment?._id]);
    }

    
    
    // let method = "PATCH";
    // let url = "appointments/";

    // var model = { 'status' : action };

    // return this._commonService
    //   .commonServiceByUrlMethodDataAsync(url, method, model, this.selectedAppointment._id)
    //   .then((data: any) => {
    //     if (data) {
    //       super.checkcustomeralerts(action, this.selectedAppointment?.attendee?._id);
         
          
    //       return;
    //     }
    //   }, (error) => {
    //     console.error(error);
    //   })

    
  }

  

  CancelAppointment() {
    this.showModal = false;
    this.cancallationreason = '';
  }

  cancelAppointmentSubmit() {
    
    if(this.cancallationreason == '') {
      this.showNotification('top', 'right', 'Fill required fields !!', 'danger');
      return;
    } else {
      var url = "/appointments/"+ this.selectedAppointment._id;
      var method = "PATCH";

      let postData = {
        status: 'cancel'
      };

      postData["property"] = {};

      if(this.selectedAppointment && this.selectedAppointment.property) {
        postData["property"] = this.selectedAppointment.property;
      } 

      postData["property"]['cancellation'] = this.cancallationreason;
      

      return this._commonService
        .commonServiceByUrlMethodDataAsync(url, method, postData)
        .then(async (data: any) => {
          if (data) {
            $("#cancelAppointmentCloseBtn").click();
            this.hide()
            this.calendarVisibility = false;
            this.LoadData();
            return;
          }
        }, (error) => {
          console.error(error);
        });
    }
  }

  appointmentStatus(action: any) {

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
              varTemp.calendarVisibility = false;
              varTemp.LoadData();
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

  isAdmin(appointment: any){
    if(appointment?.property?.group){
     return appointment?.property?.group?.billerid == appointment?.attendee?._id;
    }else{
      return true;
    }
    
  }

  checkStatus(status: any) {
    if(status) {
      if(status == "cancel" || status == "noshow" || status == "checkout") {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }

  checkOnlineMeet(appointment: any) {
    if(appointment && appointment.property && appointment.property.onlinemeet && appointment.property.onlinemeet == true && appointment.property.onlinemeeturl !== "") {
      return false;
    } else {
      return true;
    }
  }

  redirect(appointment: any) {
    var url = appointment && appointment.property && appointment.property.onlinemeet && appointment.property.onlinemeet == true && appointment.property.onlinemeeturl !== "" ? appointment.property.onlinemeeturl : "";
    this.hide()
    window.open(url, '_blank');
  }

  async viewBill(billid: any) {
    if(billid.status != "Unpaid"){
      await this.getBillPaymentByBill(billid);
    } else {
      let abillid = this.selectedAppointment && this.selectedAppointment.billid && this.selectedAppointment.billid._id ? this.selectedAppointment.billid._id : this.selectedAppointment.billid;
      this._router.navigate(["/pages/appointment-module/frontdesk/view/bill//" + abillid]);
    }
  }

  viewandprint(billid: any) {
    let abillid = this.selectedAppointment && this.selectedAppointment.billid && this.selectedAppointment.billid._id ? this.selectedAppointment.billid._id : this.selectedAppointment.billid;
    this._router.navigate(["/pages/dynamic-preview-list/bill//" + abillid]);
  }

  async getBillPaymentByBill(billid : any) {

    var url = "billpayments/filter";
    var method = "POST";

    let abillid = billid && billid._id ? billid._id : billid;

    let postData = {};
    postData['search'] = [];
    postData['search'].push({ "searchfield": 'billid', "searchvalue": abillid, "criteria": "eq", "datatype": "ObjectId" });

    this._commonService
      .commonServiceByUrlMethodData(url, method, postData)
      .pipe(takeUntil(this.destroy$))
      .subscribe((bills: any) => {
        if (bills && bills.length > 0) {
          if(bills.length == 1){
            this._router.navigate(["/pages/dynamic-preview-list/billpayment/" + bills[0]._id]);
          } else {
            this._router.navigate(["/pages/dynamic-list/list/billpayment"]);
          }
        }
      });

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

  edit() {

    var modifySchedules = this.globalfunctionpermissions.includes("Modify Schedules");
    if(modifySchedules) {
      this.editAppointment();
    } else {
      if(this.selectedAppointment && this.selectedAppointment.host && this.selectedAppointment.host._id && (this.selectedAppointment.host._id == this._loginUserId)) {
        this.editAppointment();
      } else {
        swal.fire({
          title: "Permission Denied!",
          text: "You have no edit function Permission.",
          timer: 2000,
          showConfirmButton: false
        });
      }
    }
  }

  editAppointment() {
    if(this.selectedAppointment.billid || this.selectedAppointment.packageid) {
    } else {
      this.showModal = false;
      this.addAppointmnet = true;
      this.isEdit = true;
      this.isReschedule = false;
      $("#myModalAppointmentBtn").click();

      var $body = $(document.body);
      $body.width(0);
      
    }
  }

  reschedule() {
    if(this.selectedAppointment.billid || this.selectedAppointment.packageid) {
    } else {
      this.showModal = false;
      this.addAppointmnet = true;
      this.isEdit = true;
      this.isReschedule = true;
      $("#myModalAppointmentBtn").click();

      var $body = $(document.body);
      $body.width(0);

    }
  }

  async updateAppointment(postData: any) {
    
    
    var url = "/appointments/"+ postData.id;
    var method = "PATCH";

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then(async (data: any) => {
        if (data) {
          super.showNotification('top', 'right', 'Appointment has been updated Successfully !!', 'success');
          this.addAppointmnet = false;
          this.calendarVisibility = false;
          this.dataContent = {};
          this.isEdit = false;
          this.isReschedule = false;
          this.selectedAppointment = {};
          await this.getAppointment();
          await this.getCalendarData();
          return;
        }
      }, (error) => {
        console.error(error);
      });
  }

  addProduct() {
    this.form.reset();
    this.showModal = false;
    this.form.get("productquantity").setValue(1);
    $("#addProductBtn").click();
  }

  async getProductLists() {


    let method = "POST";
    let url = "billitems/filter/view";

    let postData = {};
    postData['search'] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });
    
    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          this.productLists = [];
          this.productLists = data.filter(a=>a.categoryid != '61dbbd1c521c4f132099f87e');
          this.productLists.map(itm => itm.originalstock = itm.stock ? itm.stock : 0);
          return;
        }
      }, (error) => {
        console.error(error);
      });
  }

  private _filterProduct(value: string): any[] {
    let results;
    if (value) {
      results = this.productLists
        .filter(option => {
          if(option.itemname) {
            return option.itemname.toLowerCase().indexOf(value.toLowerCase()) === 0
          } else {
            return;
          }
        });
        if (results.length < 1) {
          results = [];
        }
    } else {
      results = this.productLists.slice();
    }
    return results;
  }

  productdisplayFn(product: any): string {
    return product && product.itemname ? product.itemname : '';
  }

  async onPorductSubmit(value: any, valid: boolean) {
    this.submitted = true;
    if (!valid) {
      super.showNotification("top", "right", "Validation Failed !!", "danger");
      return;
    } else {
      if(!value?.product?._id) {
        this.showNotification('top', 'right', 'Please select valid products !!', 'danger');
        return;
      } else if (value.productquantity === 0 ) {
        this.showNotification('top', 'right', 'Quantity cannot be 0 !!', 'danger');
        return;
      } else if (value.productquantity && value.productquantity < 1) {
        this.showNotification('top', 'right', 'Quantity should greater then 0 !!', 'danger');
        return;
      }

      let postData = {};

      postData["resourceids"] = [];

      if(this.selectedAppointment && this.selectedAppointment.resourceids && this.selectedAppointment.resourceids.length > 0) {
        postData["resourceids"] =  [...this.selectedAppointment.resourceids];
      }
      let obj = {
        id: value.product._id,
        onModel:  'Billitem',
        product: true,
        quantity: value.productquantity
      }

      postData["resourceids"].push(obj);


      var url = "/appointments/"+ this.selectedAppointment._id;
      var method = "PATCH";
      this.disableBtn = true;
      return this._commonService
        .commonServiceByUrlMethodDataAsync(url, method, postData)
        .then((data: any) => {
          if (data) {
            $("#addproductclose").click();
            this.addAppointmnet = false;
            this.calendarVisibility = false;
            this.dataContent = {};
            this.isEdit = false;
            this.isReschedule = false;
            this.selectedAppointment = {};
            this.disableBtn = false;
            this.LoadData();

            return;
          }
        }, (error) => {
          console.error(error);
          this.disableBtn = false;
        });

      
    }
  }

  takedeposit() {
    this.showModal = false;
    if(this.selectedAppointment?.deposits){ 
      this.paymentForm.get("paymentdate").setValue(this.selectedAppointment?.deposits?.paymentdate);
      this.paymentForm.get("paidamount").setValue(this.selectedAppointment?.deposits?.paidamount);
      this.paymentForm.get("chqnumber").setValue(this.selectedAppointment?.deposits?.chqnumber);
      this.paymentForm.get("tidnumber").setValue(this.selectedAppointment?.deposits?.tidnumber);
      this.paymentForm.get("cardnumber").setValue(this.selectedAppointment?.deposits?.cardnumber);
      this.paymentForm.get("accountnumber").setValue(this.selectedAppointment?.deposits?.accountnumber);
      this.paymentForm.get("chqdate").setValue(this.selectedAppointment?.deposits?.chqdate);
      
      this.paymentreceivedby_fields.visible = false;
      this.mode_fields.visible = false;
      this.bankname_fields.visible = false;
      this.chequestatus_fields.visible = false;
      
      setTimeout(() => {
        this.paymentreceivedby_fields.modelValue = this.selectedAppointment?.deposits?.receivedby;
        this.paymentreceivedby_fields.visible = true;
        this.mode_fields.dbvalue = this.selectedAppointment?.deposits?.mode;
        this.mode_fields.visible = true;
        this.bankname_fields.dbvalue = this.selectedAppointment?.deposits?.bankname;
        this.bankname_fields.visible = true;
        this.chequestatus_fields.dbvalue = this.selectedAppointment?.deposits?.chqstatus;
        this.chequestatus_fields.visible = true;
      });
    }else{
      this.paymentForm.get("paymentdate").setValue(new Date());
      this.paymentreceivedby_fields.visible = false;
      setTimeout(() => {
        this.paymentreceivedby_fields.modelValue = this._loginUserId;
        this.paymentreceivedby_fields.visible = true;
      });
    }
    $("#takeDipositeBtn").click();
  }


  async onPaymentSubmit(value: any, valid: boolean) {
     this.paymentSubmitted = true;

    if (!valid) {
      this.showNotification("top", "right", "Validation failed !!", "danger");
      return;
    }
    
    let postData = {};
    postData['deposits'] = {};
    postData['deposits']['paidamount'] = value.paidamount;
    postData['deposits']['mode'] = value.mode.autocomplete_id;
    postData['deposits']['receivedby'] = value.paymentreceivedby.autocomplete_id;
    postData['deposits']['paymentdate'] = value.paymentdate._d ? value.paymentdate._d : value.paymentdate;
    postData['deposits']['receiptnumber'] = value && value.receiptnumber ? value.receiptnumber : undefined;
    postData['deposits']['chqnumber'] = value && value.chqnumber ? value.chqnumber : undefined;
    postData['deposits']['bankname'] = value && value.bankname && value.bankname.autocomplete_id ? value.bankname.autocomplete_id : undefined;
    postData['deposits']['chqdate'] = value && value.chqdate ? value.chqdate : undefined;
    postData['deposits']['chqstatus'] = value && value.chqstatus && value.chqstatus.autocomplete_id ? value.chqstatus.autocomplete_id : undefined;
    postData['deposits']['cardnumber'] = value && value.cardnumber ? value.cardnumber : undefined;
    postData['deposits']['tidnumber'] = value && value.tidnumber ? value.tidnumber : undefined;

    var url = "/appointments/"+ this.selectedAppointment._id;
    var method = "PATCH";

    
    this.disableBtn = true;
    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          this.paymentForm.reset();
          $("#takedipositeclose").click();
          this.addAppointmnet = false;
          this.calendarVisibility = false;
          this.dataContent = {};
          this.isEdit = false;
          this.isReschedule = false;
          this.selectedAppointment = {};
          this.disableBtn = false;
          this.LoadData();

          return;
        }
      }, (error) => {
        console.error(error);
        this.disableBtn = false;
      });
    

  }

  addtoGroup() {
    this.showModal = false;
    $("#addGroupBtn").click();
  }

  async onGroupSubmit(value: any, valid: boolean) {

    this.groupSubmitted = true;
    if (!valid) {
      this.showNotification("top", "right", "Validation failed !!", "danger");
      return;
    }

    let postData = {};
    postData["property"] = {};

    if(this.selectedAppointment && this.selectedAppointment.property) {
      postData["property"] = {...this.selectedAppointment.property};
    }

    postData["property"]["group"] = {};
    postData["property"]["group"]["id"] = this.uuidv4();
    postData["property"]["group"]["title"] = value.grouptitle;
    postData["property"]["group"]["billerid"] = this.selectedAppointment?.attendee?._id;
    

    var url = "/appointments/"+ this.selectedAppointment._id;
    var method = "PATCH";

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          this.groupForm.reset();
          $("#addGroupclose").click();
          this.addAppointmnet = false;
          this.calendarVisibility = false;
          this.dataContent = {};
          this.isEdit = false;
          this.isReschedule = false;
          this.selectedAppointment = {};
          this.LoadData();

          return;
        }
      }, (error) => {
        console.error(error);
      });
    

  }

  async groupAdding(item: any) {

    let postData = {};
    postData["property"] = {};

    if(this.selectedAppointment && this.selectedAppointment.property) {
      postData["property"] = {...this.selectedAppointment.property};
    }

    postData["property"]["group"] = {};
    postData["property"]["group"]["id"] = item.id;
    postData["property"]["group"]["title"] = item.title;
    postData["property"]["group"]["billerid"] = item.billerid;
    

    var url = "/appointments/"+ this.selectedAppointment._id;
    var method = "PATCH";

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          this.showModal = false;
          this.addAppointmnet = false;
          this.calendarVisibility = false;
          this.dataContent = {};
          this.isEdit = false;
          this.isReschedule = false;
          this.selectedAppointment = {};
          this.LoadData();

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

  removeGroup() {

    let postData = {};
    postData["property"] = {};

    if(this.selectedAppointment && this.selectedAppointment.property) {
      postData["property"] = {...this.selectedAppointment.property};
    }

    delete postData["property"]["group"];

    var url = "/appointments/"+ this.selectedAppointment._id;
    var method = "PATCH";
    
    const varTemp = this;

    swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this action!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Yes, Remove it!`,
      cancelButtonText: 'No, keep it',
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false

    }).then((result) => {

      if (result.value) {

        return varTemp._commonService
          .commonServiceByUrlMethodDataAsync(url, method, postData)
          .then((data: any) => {
            if (data) {

              varTemp.showNotification("top", "right", "Group has been Removed successfuly!!", "success");

              varTemp.showModal = false;
              varTemp.addAppointmnet = false;
              varTemp.calendarVisibility = false;
              varTemp.dataContent = {};
              varTemp.isEdit = false;
              varTemp.isReschedule = false;
              varTemp.selectedAppointment = {};
              varTemp.LoadData();

              return;
            }
        }, (error) => {
          console.error(error);
        });

          
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

  openprofile(profile: any) {
    
    if (profile.onModel=="Groupclass"){      
      this._router.navigate([]).then(result => {  window.open( `/pages/membership/class/groupclass/${profile.attendee._id}`, '_blank'); });
    } else if (profile.onModel=="Member"){      
      this._router.navigate([]).then(result => {  window.open( `/pages/members/profile/${profile.attendee._id}`, '_blank'); });
    } else {
      this._router.navigate([]).then(result => {  window.open( `/pages/customer-module/profile/${profile.attendee._id}`, '_blank'); });
    }

  }

  removeProduct(item: any) {
    let postData = {};
    postData["resourceids"] = [];
    if(this.selectedAppointment && this.selectedAppointment.resourceids && this.selectedAppointment.resourceids.length > 0) {
      this.selectedAppointment.resourceids.forEach(element => {
        let resourceObj = {
          id: element?.id?._id,
          onModel:  element.onModel,
          product: element.product ? element.product : false,
        }
        postData["resourceids"].push(resourceObj);
      });
    }
    var id = item.id._id;
    var index = postData["resourceids"].map(x => { return x.id; }).indexOf(id);
    postData["resourceids"].splice(index, 1);

    var url = "/appointments/"+ this.selectedAppointment._id;
    var method = "PATCH";

    const varTemp = this;

    swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this action!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Yes, Remove it!`,
      cancelButtonText: 'No, keep it',
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false

    }).then((result) => {

      if (result.value) {

        return varTemp._commonService
          .commonServiceByUrlMethodDataAsync(url, method, postData)
          .then((data: any) => {
            if (data) {

              varTemp.showNotification("top", "right", "Product has been Removed successfuly!!", "success");

              varTemp.showModal = false;
              varTemp.addAppointmnet = false;
              varTemp.calendarVisibility = false;
              varTemp.dataContent = {};
              varTemp.isEdit = false;
              varTemp.isReschedule = false;
              varTemp.selectedAppointment = {};
              varTemp.LoadData();

              return;
            }
        }, (error) => {
          console.error(error);
        });

          
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
