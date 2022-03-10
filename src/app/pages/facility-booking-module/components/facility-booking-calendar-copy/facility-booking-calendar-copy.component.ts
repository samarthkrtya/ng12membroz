import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

import { MatButtonToggleAppearance } from '@angular/material/button-toggle';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CalendarOptions, DateSelectArg, EventClickArg } from '@fullcalendar/angular'; // useful for typechecking


import { BaseComponemntComponent, BaseComponemntInterface } from '../../../../shared/base-componemnt/base-componemnt.component';

declare var $: any;
import swal from 'sweetalert2';

@Component({
  selector: 'app-facility-booking-calendar-copy',
  templateUrl: './facility-booking-calendar-copy.component.html',
  styles: [
  ]
})
export class FacilityBookingCalendarCopyComponent extends BaseComponemntComponent implements OnInit, BaseComponemntInterface {

  disabled = false;
  appearance: MatButtonToggleAppearance = 'standard';

  calendarOptions: CalendarOptions;

  destroy$: Subject<boolean> = new Subject<boolean>();

  serviceLists: any[] = [];
  selectedService: any[] = [];
  selectedStatus: any[] = [];

  facilitybookingList: any[] = [];
  resources: any[] = [];
  events: any[] = [];

  calendarVisibility: boolean = false;
  displayAddBtn: boolean = false;

  workingdays: string[] = [];
  slotDuration: string;
  slotMinTime: string;
  slotMaxTime: string;
  height: number;

  serviceFormGroup: FormGroup;

  status = [{
    id: 'requested',
    name: 'Requested'
  }, {
    id: 'checkout',
    name: 'Checkout'
  }, {
    id: 'confirmed',
    name: 'Confirmed'
  }, {
    id: 'cancel',
    name: 'Cancel'
  }, {
    id: 'noshow',
    name: 'No Show'
  }];
  days: string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  date: Date;
  dataContent: any;

  showModal: boolean;

  selectedfacilitybooking: any;

  addfacilitybookingVisibility: boolean = false;

  daysOfWeek: any [] = [];

  holidayLists: any [] = [];
  workinghours: any = {};

  dateInfo: any = {};

  index: number;

  constructor() {
    super()
    this.pagename = "app-facility-booking-calendar";

    this.serviceFormGroup = new FormGroup({
      service: new FormControl([])
    })

    this.serviceFormGroup.valueChanges.subscribe(res => {
      this.selectedService = [];
      this.selectedService = res.service;
      this.getCalendarData()
    });

  }

  async ngOnInit() {
    try {
      await super.ngOnInit()
      await this.initializeVariables()
      await this.LoadData()
    } catch (error) {
      console.error(error)
    } finally {
    }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }

  async LoadData() {
    try {
      await this.getServiceLists();
      await this.getfacilityAvailability()
      await this.getAppointment();
      await this.getCalendarData();
    } catch (error) {
      console.error(error)
    }
  }

  Save() { }
  Update() { }
  Delete() { }
  ActionCall() { }

  async initializeVariables() {

    this.serviceLists = [];
    this.facilitybookingList = [];
    this.resources = [];
    this.events = [];
    this.calendarVisibility = false;
    this.slotDuration = "00:15:00";
    this.slotMinTime = "00:00:00";
    this.slotMaxTime = "24:00:00";
    this.height = 1350;

    this.date = new Date();
    this.daysOfWeek = [];

    var branch = this._authService.currentUser.user.branchid;
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
    if (this.workingdays.includes(day)) {
      this.displayAddBtn = true;
    }

    this.addfacilitybookingVisibility = false;

    this.holidayLists = [];

    
    this.workinghours = {};
    this.workinghours = branch.workinghours;

    this.dateInfo = {};
    this.index = 0;

    return;
  }

  async getServiceLists() {

    let method = "POST";
    let url = "assets/filter";

    let postData = {};
    postData['search'] = [];
    postData['search'].push({ "searchfield": 'status', "searchvalue": "active", "criteria": "eq" });
    postData['search'].push({ "searchfield": 'bookingtype', "searchvalue": "HOURLY", "criteria": "eq" });

    await this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          this.serviceLists = data;
          this.serviceLists.map(a => a.id = a._id);
        }
      }).catch((error) => {
        console.error(error);
      })
  }

  async getfacilityAvailability() {


    var today = new Date(this.date);
    today.setHours(0, 0, 0, 0);

    var tommrrow = new Date(this.date);
    tommrrow.setDate(tommrrow.getDate() + 1);
    tommrrow.setHours(0, 0, 0, 0);

    var faciliyids = this.serviceLists.map(choice => (choice._id));

    var url = "analyticsreports/process";
    var method = "POST";

    let postData = {};
    postData['id'] = "61a0c5c04220efd6ed1feec6";
    
    postData['search'] = [];
    postData['search'].push({ "searchfield": 'facilityids', "searchvalue": faciliyids, "criteria": "in", "datatype": "ObjectId"});
    postData['search'].push({ "searchfield": 'startdate', "searchvalue": today, "criteria": "eq", "datatype": "date" });
    postData['search'].push({ "searchfield": 'enddate', "searchvalue": tommrrow, "criteria": "eq", "datatype": "date" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          
          data.forEach(element => {
            var analyticsObj = this.serviceLists.find(p=> ((p._id == element._id) && (new Date(element.date).toDateString() === new Date(this.date).toDateString()) ));
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
    let url = "facilitybookings/filter";

    var sdate = new Date(this.date);
    //today.setHours(0, 0, 0, 0);

    var tommrrow = new Date(this.date);
    tommrrow.setDate(tommrrow.getDate() + 1);
    //tommrrow.setHours(0, 0, 0, 0);

    let postData = {};
    postData["search"] = [];
    
    if(this.dateInfo?.view?.type == "dayGridMonth" || this.dateInfo?.view?.type == "timeGridWeek") {

      var date = new Date(this.dateInfo.view.currentStart);
      var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
      var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      postData["search"].push({ "searchfield": "bookingdate", "searchvalue": { "$gte": firstDay, "$lt": lastDay }, "criteria": "eq", "datatype": "Date" });
    } else {
      postData["search"].push({ "searchfield": "bookingdate", "searchvalue": new Date(sdate.getFullYear(), sdate.getMonth(), sdate.getDate()), "criteria": "fullday", "datatype": "Date" });
    }
    
    
    
    
    if (this.selectedStatus.length > 0) {
      postData["search"].push({ "searchfield": "status", "searchvalue": this.selectedStatus, "criteria": "in" });
    }

    console.log("postData", postData);
    
    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          console.log("data", data);
          this.facilitybookingList = data;
          return
        }
      }).catch((error) => {
        console.error(error);
      });
  }

  async getCalendarData() {

    this.events = [];
    this.resources = [];


    this.selectedService.forEach(element => {
      this.serviceLists.forEach(elementService => {
        if (elementService.id == element) {
          this.resources.push(elementService);
        }
      });
    });
    this.events = this.facilitybookingList;

    this.events.forEach(element => {

      element.id = element._id;
      element.resourceId = element.refid._id;
      element.title = element?.customerid?.fullname;

      element.memberprofilepic = element && element.customerid && element.customerid.profilepic ? element.customerid.profilepic : './assets/img/default-avatar.png';

      var start = new Date(element.bookingdate);
      var startTime = element?.timeslot?.starttime?.split(":");
      if(startTime && startTime[0] && startTime[1]) {
        start.setHours(startTime[0]);
        start.setMinutes(startTime[1]);
      }


      var end = new Date(element.bookingdate);
      var endTime = element?.timeslot?.endtime?.split(":");
      if(endTime && endTime[0] && endTime[1]) {
        end.setHours(endTime[0]);
        end.setMinutes(endTime[1]);
      }


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
        editable: true,
        scrollTime: this.slotMinTime,
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
        eventMouseEnter: eventEnter => {
        },
        eventMouseLeave: eventLeave => {
        },
        eventDrop: eventDrop => {
        },
        datesSet: (dateInfo) => {
          this.search(dateInfo); // Call custom code
        }
      };
      this.calendarVisibility = true;
      console.log("calendarOptions", this.calendarOptions);
    }
    return;
  }

  async search(dateInfo: any) {

    this.dateInfo = {};
    this.dateInfo = dateInfo;

    if(this.index !== 0) {
      try {
        this.date = new Date(dateInfo.start)
        await this.getfacilityAvailability()
        await this.getAppointment();
        await this.getCalendarData()
      } catch(error) {
        console.error(error)
      } finally {
      }
    } else if (this.index == 0) {
      this.index++
    }
  }


  dateChange(date: any) {
    this.date = date._d ? date._d : date;
    this.calendarVisibility = false;
    this.LoadData();
    this.displayAddBtn = false;
    var day = this.days[this.date.getDay()];
    if (this.workingdays.includes(day)) {
      this.displayAddBtn = true;
    }
  }

  async onStatusChanges(value: []) {
    this.selectedStatus = value;
    await this.getAppointment();
    await this.getCalendarData();
  }

  getSubmittedData(submitData: any) {
    $("#appointmentClose").click();
    this.addfacilitybookingVisibility = false;
    this.calendarVisibility = false;
    this.dataContent = {};
    this.LoadData();
  }

  handleDateSelect(selectInfo: DateSelectArg) {
    $("#myModalAppointmentBtn").click();
  }

  handleEventClick(clickInfo: EventClickArg) {
    this.selectedfacilitybooking = {};
    var facilitybookingObj = this.facilitybookingList.find(p => p._id == clickInfo.event.id)
    if (facilitybookingObj) {
      this.selectedfacilitybooking = facilitybookingObj;
      this.selectedfacilitybooking.title = clickInfo.event.title;
      if (this.selectedfacilitybooking.status == "checkout") {
        this.viewBill(this.selectedfacilitybooking.billid)
      } else {
        this.showModal = true;
      }
    }
  }

  hide() {
    this.showModal = false;
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
        let url = "facilitybookings";

        var model = { 'status': action };

        return varTemp._commonService
          .commonServiceByUrlMethodDataAsync(url, method, model, varTemp.selectedfacilitybooking._id)
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

  cancel() {
    this.addfacilitybookingVisibility = false;
  }

  addfacilitybooking() {
    this.addfacilitybookingVisibility = true;
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

  async viewBill(billid: any) {
    if(billid.status != "Unpaid"){
      await this.getBillPaymentByBill(billid);
    } else {
      let fbillid = this.selectedfacilitybooking && this.selectedfacilitybooking.billid && this.selectedfacilitybooking.billid._id ? this.selectedfacilitybooking.billid._id : this.selectedfacilitybooking.billid
      this._router.navigate(["/pages/dynamic-preview-list/bill/" + fbillid]);
    }
  }

  async getBillPaymentByBill(billid : any) {

    var url = "billpayments/filter";
    var method = "POST";
    let fbillid =  billid && billid._id ? billid._id : billid;

    let postData = {};
    postData['search'] = [];
    postData['search'].push({ "searchfield": 'billid', "searchvalue": fbillid, "criteria": "eq", "datatype": "ObjectId" });

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

}