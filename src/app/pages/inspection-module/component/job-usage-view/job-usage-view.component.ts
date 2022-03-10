import { Component, OnInit } from '@angular/core';

import { Subject } from 'rxjs';
import { BaseComponemntComponent } from '../../../../shared/base-componemnt/base-componemnt.component';

import { CalendarOptions, DateSelectArg, EventClickArg } from '@fullcalendar/angular'; // useful for typechecking

declare var $: any;
import swal from 'sweetalert2';

@Component({
  selector: 'app-job-usage-view',
  templateUrl: './job-usage-view.component.html',
  styles: [
  ]
})
export class JobUsageViewComponent extends BaseComponemntComponent implements OnInit  {

  destroy$: Subject<boolean> = new Subject<boolean>();
  
  calendarOptions: CalendarOptions;
  calendarVisible: boolean = false;

  resourceAreaColumns: any [] = [];
  resources: any [] = [];
  events: any [] = [];

  showModal: boolean;
  selectedAppointment: any;
  appointmentLists: any [] = [];

  constructor() {
    super()
   }

  async ngOnInit() {
    try {
      await super.ngOnInit()
      await this.initializeVariables()
      await this.getActivityData();
      await this.getCalendarData()
    } catch(error) {
      console.log("error", error)
    }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }

  async initializeVariables() {
    this.calendarVisible = false;
    this.resourceAreaColumns = [];
    this.resources = [];
    this.events = [];
    this.showModal = false;
    this.selectedAppointment = {};
    this.appointmentLists = [];
    return;
  }

  async getActivityData() {

    var url = "activities/jobactivityview/filter";
    var method = "POST";

    let postData = {};

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data && data[0]) {

          this.appointmentLists = [];
          this.appointmentLists = data;

          let obj = { id: 0, title: 'Unassign'}
          this.resources.push(obj)

          data.forEach(element => {

            if(element && element.user && element.user._id) {
              var userObj = this.resources.find(p=>p.id == element._id);
              if(!userObj) {
                let obj = { id: element.user._id, title: element.user.fullname}
                this.resources.push(obj)
              }
            }

            element.memberprofilepic = element && element.attendee && element.customer.profilepic ? element.customer.profilepic : './assets/img/default-avatar.png';

            let eventObj = { 
              id: element._id, 
              resourceId: element && element.user && element.user._id ? element.user._id : 0, 
              title: element?.service?.title, 
              //title: element?.vehicle?.property?.license_plate + ' | ' + element.customer.fullname, 
              start: element?.duedate,
              color: element.status == 'completed' ? '#47CCBF' : element.status == 'onhold' ? '#3D57D2' : element.status == 'inprogress' ? '#F57C00' : '#FB3E39'
            };

            this.events.push(eventObj)

          });
          
        }
      })

  }

  async getCalendarData() {

    this.calendarOptions = {
      initialView: 'resourceTimelineWeek',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'resourceTimelineDay, resourceTimelineWeek'
      },
      resourceAreaWidth: '10%',
      resourceAreaColumns: this.resourceAreaColumns,
      resources: this.resources,
      events: this.events,
      slotDuration: { days: 1 },
      schedulerLicenseKey: 'CC-Attribution-NonCommercial-NoDerivatives',
      displayEventTime: false,
      eventClick: this.handleEventClick.bind(this),
      
    }
    this.calendarVisible = true;
    return;
  }

  handleEventClick(clickInfo: EventClickArg) {
    this.selectedAppointment = {};
    var appointmentObj = this.appointmentLists.find(p => p._id == clickInfo.event.id)
    console.log("appointmentObj", appointmentObj);
    if (appointmentObj) {
      this.selectedAppointment = appointmentObj;
      console.log("selectedAppointment", this.selectedAppointment);
      this.selectedAppointment.title = clickInfo.event.title;
      this.showModal = true;
    }
  }

  hide() {
    this.showModal = false;
  }
  
  appointmentStatus() {

    const varTemp = this;

    swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this action!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Yes, Close it!`,
      cancelButtonText: 'No, keep it',
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false
    }).then((result) => {
      if (result.value) {

        let method = "PATCH";
        let url = "activities/";

        var model = { 'status' : 'completed' };

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
