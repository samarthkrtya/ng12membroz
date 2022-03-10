import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';

import { MatButtonToggleAppearance } from '@angular/material/button-toggle';


import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import * as moment from 'moment';

import { CalendarOptions, DateSelectArg, EventClickArg } from '@fullcalendar/angular'; // useful for typechecking

import { BaseLiteComponemntComponent } from '../../../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import { CommonService } from '../../../../../../core/services/common/common.service';

declare var $: any;
import swal from 'sweetalert2';

@Component({
  selector: 'app-customer-booking-calendar',
  templateUrl: './customer-booking-calendar.component.html',
  styles: [
  ]
})
export class CustomerBookingCalendarComponent extends BaseLiteComponemntComponent implements OnInit {

  @Input() dataContent: any;
  @Input() bindId: any;
  
  serviceLists: any[] = [];
  staffLists: any[] = [];
  appointmentLists: any[] = [];
  filterappointmentData: any[] = [];
  
  calendarOptions: CalendarOptions;

  destroy$: Subject<boolean> = new Subject<boolean>();

  calendarVisibility: boolean = false;

  workingdays: string[]= [];
  slotDuration: string;
  slotMinTime: string;
  slotMaxTime: string;
  height: number;

  disableBtn: boolean = false;

  holidayLists: any [] = [];
  workinghours: any = {};

  daysOfWeek: any [] = [];

  dateInfo: any = {};

  index: number;

  date: Date;

  resources: any[] = [];
  events: any[] = [];
  actionValue: any;

  addAppointmnet: boolean;

  showModal: boolean;
  selectedAppointment: any;
  

  constructor(
    private _commonService: CommonService
  ) {
    super()
  }

  async ngOnInit() {
    try {
      await super.ngOnInit()
      await this.initializeVariables()
      await this.LoadData()
    } catch (error) {
      console.error(error)
    } finally {
      this.disableBtn = false;
    }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }

  async initializeVariables() {

    this.serviceLists = [];
    this.staffLists = [];
    this.appointmentLists = [];
    this.filterappointmentData = [];
    this.resources = [];

    this.actionValue = "staff";

    this.calendarVisibility = false;
    this.slotDuration = "00:15:00";
    this.slotMinTime = "00:00:00";
    this.slotMaxTime = "24:00:00";
    this.height = 1350;

    this.date = new Date();

    var branch  = this._authService.currentUser.user.branchid;

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
    
    this.holidayLists = [];


    this.workinghours = {};
    this.workinghours = branch.workinghours;

    this.dateInfo = {};
    this.index = 0;

    this.addAppointmnet = false;

    return;
  }

  async LoadData() {
    console.log("load");
    try {
      await this.getServiceLists();
      await this.getStaffAvailability()
      await this.getAppointment();
      await this.getCalendarData();
      await this.getAllHolidays()
    } catch (error) {
      console.error(error)
    }
  }

  async getServiceLists() {

    let method = "POST";
    let url = "services/filter";

    let postData = {};
    postData['search'] = [];
    postData['search'].push({ "searchfield": 'status', "searchvalue": "active", "criteria": "eq" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          this.serviceLists = data;
          this.serviceLists.forEach(element => {
            element.id = element._id;
            if (element && element.staff && element.staff.length !== 0) {
              element.staff.forEach(elementStaff => {

                if(elementStaff.status == "active") {
                  elementStaff.id = elementStaff._id
                  elementStaff.title = elementStaff.fullname

                  var staffObj = this.staffLists.find(p => p.id == elementStaff.id);
                  if (!staffObj) {
                    this.staffLists.push(elementStaff)
                  }
                }

              });
            }
          });
          return;
        }
      }, (error) => {
        console.error(error);
      })
  }

  async getStaffAvailability() {


    var today = new Date(this.date);
    today.setHours(0, 0, 0, 0);

    var tommrrow = new Date(this.date);
    tommrrow.setDate(tommrrow.getDate() + 1);
    tommrrow.setHours(0, 0, 0, 0);

    var staffids = this.staffLists.map(choice => (choice._id));

    var url = "analyticsreports/process";
    var method = "POST";

    let postData = {};
    postData['id'] = "619c87614220efd6edda0232";
    
    postData['search'] = [];
    postData['search'].push({ "searchfield": 'staffids', "searchvalue": staffids, "criteria": "in", "datatype": "ObjectId"});
    postData['search'].push({ "searchfield": 'startdate', "searchvalue": today, "criteria": "eq", "datatype": "date" });
    postData['search'].push({ "searchfield": 'enddate', "searchvalue": tommrrow, "criteria": "eq", "datatype": "date" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          data.forEach(element => {
            var analyticsObj = this.staffLists.find(p=> ((p._id == element._id) && (new Date(element.date).toDateString() === new Date(this.date).toDateString()) ));
            if(analyticsObj) {
              
              analyticsObj.businessHours = {};
              analyticsObj.businessHours.daysOfWeek = [0, 1, 2, 3, 4, 5, 6, 7];
              analyticsObj.businessHours.startTime =  this.slotMinTime;
              analyticsObj.businessHours.endTime =  this.slotMaxTime;

              if(element.isnoavailable || element.isHoliday || element.isClosed) {
                var day = this.date.getDay();
                const index = analyticsObj.businessHours.daysOfWeek.indexOf(day);
                if (index > -1) {
                  analyticsObj.businessHours.daysOfWeek.splice(index, 1);
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

  async getAppointment() {

    let method = "POST";
    let url = "appointments/filter";

    var sdate = new Date(this.date);
    //today.setHours(0, 0, 0, 0);

    // var tommrrow = new Date(this.date);
    // tommrrow.setDate(tommrrow.getDate() + 1);
    //tommrrow.setHours(0, 0, 0, 0);

    // console.log("dateInfo", this.dateInfo)
    //console.log("calendarOptions", this.calendarOptions.)

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "deleted", "criteria": "ne" });

    if(this.dateInfo?.view?.type == "dayGridMonth" || this.dateInfo?.view?.type == "timeGridWeek") {
    
      var date = new Date(this.dateInfo?.view?.currentStart);
      var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
      var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      postData["search"].push({ "searchfield": "appointmentdate", "searchvalue": { "$gte": firstDay, "$lt": lastDay }, "criteria": "eq", "datatype": "Date" });
    } else {
      postData["search"].push({ "searchfield": "appointmentdate", "searchvalue": new Date(sdate.getFullYear(), sdate.getMonth(), sdate.getDate()), "criteria": "fullday", "datatype": "Date" });
    }


    postData["search"].push({ "searchfield": "attendee", "searchvalue": this.bindId, "criteria": "eq" });

    
    console.log("postData", postData);

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {

          console.log("data", data);

          this.appointmentLists = data;
          this.filterappointmentData = [...data];
          return;
        }
      }, (error) => {
        console.error(error);
      });
  }

  async getCalendarData() {

    this.events = [];
    this.resources = [];

    if (this.actionValue == "staff") {
      this.resources = [...this.staffLists];
    } else {
      this.resources = [...this.serviceLists];
    }

    this.events = [...this.filterappointmentData];

    this.events.forEach(element => {

      element.id = element._id;
      if (this.actionValue == "staff") {
        element.resourceId = element?.host?._id;
        
        var hostString = "";
        if(element && element.host && element.host.fullname) {
          hostString = " | " + element?.host?.fullname;
        }

        element.title = element?.refid?.title + hostString;

      } else {
        element.resourceId = element?.refid?._id;

        var serviceString = "";
        if(element && element.refid && element.refid.title) {
          serviceString = " | " + element?.refid?.title;
        }

        element.title = element?.host?.fullname + serviceString;
      }

      element.memberprofilepic = element && element.attendee && element.attendee.profilepic ? element.attendee.profilepic : './assets/img/default-avatar.png';

      var start = new Date(element.appointmentdate);
      var startTime = element.timeslot.starttime.split(":");
      start.setHours(startTime[0]);
      start.setMinutes(startTime[1]);

      var end = new Date(element.appointmentdate);
      var endTime = element.timeslot.endtime.split(":");
      end.setHours(endTime[0]);
      end.setMinutes(endTime[1]);

      element.start = start;
      element.end = end;

      element.allDay = false

      if (element.status == "noshow") {
        element.color = '#f57c00';
      } else if (element.status == "cancel") {
        element.color = '#FB3E39';
      } else if (element.status == "requested") {
        element.color = '#3D58D4';
      } else if (element.status == "confirmed") {
        element.color = '#E152BF';
      } else if (element.status == "checkout") {
        element.color = '#47CCBF';
      }


    });

    if(this.slotMinTime && this.slotMaxTime && this.date) {

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


        slotMinTime: "00:00:00",
        slotMaxTime: "24:00:00",

        businessHours: {
          daysOfWeek: this.daysOfWeek,
          startTime: this.slotMinTime, 
          endTime: this.slotMaxTime, 
        },

        scrollTime: this.slotMinTime,

        // slotMinTime: this.slotMinTime,
        // slotMaxTime: this.slotMaxTime,
        initialDate: this.date,
        selectConstraint: "businessHours",

        views: {
          resourceTimeGridFourDay: {
            type: 'resourceTimeGrid',
            duration: { days: 4 },
            buttonText: '4 days'
          },
          
        },

        select: this.handleDateSelect.bind(this),
        eventClick: this.handleEventClick.bind(this),
        eventDidMount: function(info) {
          

          if(info && info.event && info.event.extendedProps && info.event.extendedProps.property && info.event.extendedProps.property.onlinemeet && info.event.extendedProps.property.onlinemeet == true && info.event.extendedProps.property.onlinemeeturl && info.event.extendedProps.property.onlinemeeturl !== "") {
            var attendee = info.event.extendedProps.attendee.fullname;
            var customTitleForMonth = info.event.title;
            $(info.el).find(".fc-sticky").html("<span>"+ attendee +"</span><span>"+ customTitleForMonth +"</span><button> START NOW </button>");
          } else {
            var attendee = info?.event?.extendedProps?.attendee?.fullname;
            var customTitleForMonth = info?.event?.title;
            $(info.el).find(".fc-sticky").html("<span>"+ attendee +"</span><span class='d-inline'>"+ customTitleForMonth +"</span>");
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
          //console.log("called", dateInfo)
          this.search(dateInfo); // Call custom code
        }
      };

      this.calendarVisibility = true;

    }
    return;
  }

  handleDateSelect(selectInfo: DateSelectArg) {
    $("#myModalAppointmentBtn").click();
  }

  handleEventClick(clickInfo: EventClickArg) {

    this.selectedAppointment = {};
    var appointmentObj = this.appointmentLists.find(p => p._id == clickInfo.event.id)
    if (appointmentObj) {

      this.selectedAppointment = appointmentObj;
      // console.log("selectedAppointment", this.selectedAppointment);
      this.selectedAppointment.title = clickInfo.event.title;

      
      if(this.selectedAppointment && this.selectedAppointment.property && this.selectedAppointment.property.onlinemeet && this.selectedAppointment.property.onlinemeet == true && this.selectedAppointment.property.onlinemeeturl && this.selectedAppointment.property.onlinemeeturl !== "") {
        var url = this.selectedAppointment.property.onlinemeeturl;
        window.open(url, '_blank');
      } else if (this.selectedAppointment.status == "checkout") {
        this.viewBill(this.selectedAppointment.billid)
      } else {
        this.showModal = true;
      }
    }
  }

  async search(dateInfo: any) {

    this.dateInfo = {};
    this.dateInfo = dateInfo;

    if(this.index !== 0) {
      try {
        this.date = new Date(dateInfo.start)
        await this.getStaffAvailability()
        await this.getAppointment();
        await this.getCalendarData()
      } catch(error) {
        console.log(error)
      } finally {
      }
    } else if (this.index == 0) {
      this.index++
    }
    
    
  }

  async viewBill(billid: any) {
    if(billid.status != "Unpaid"){
      await this.getBillPaymentByBill(billid);
    } else {
      let abillid = this.selectedAppointment && this.selectedAppointment.billid && this.selectedAppointment.billid._id ? this.selectedAppointment.billid._id : this.selectedAppointment.billid;
      this._router.navigate(["/pages/dynamic-preview-list/bill/" + abillid]);
    }
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

  hide() {
    this.showModal = false;
  }

  checkStatus(status: any) {
    if(status) {
      if(status == "cancel" || status == "noshow") {
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

  addAppointment() {
    this.addAppointmnet = true;
  }

  cancel() {
    this.addAppointmnet = false;
  }

  getSubmittedData(submitData: any) {
    $("#appointmentClose").click();
    this.addAppointmnet = false;
    this.calendarVisibility = false;
    this.LoadData();
  }

}
