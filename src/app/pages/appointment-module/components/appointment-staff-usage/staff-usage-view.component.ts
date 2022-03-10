import { Component, OnDestroy, OnInit } from '@angular/core';

import { Subject } from 'rxjs';
import { BaseComponemntComponent } from '../../../../shared/base-componemnt/base-componemnt.component';

import { CalendarOptions, DateSelectArg, EventClickArg } from '@fullcalendar/angular'; // useful for typechecking

declare var $: any;
import swal from 'sweetalert2';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-job-usage-view',
  templateUrl: './staff-usage-view.component.html',
  styles: [
  ]
})

export class StaffUsageViewComponent extends BaseComponemntComponent implements OnInit , OnDestroy  {

  destroy$: Subject<boolean> = new Subject<boolean>();
  
  calendarOptions: CalendarOptions;
  calendarVisible: boolean = false;

  resourceAreaColumns: any [] = [];
  resources: any [] = [];
  events: any [] = [];

  showModal: boolean;
  selectedAppointment: any;
  appointmentLists: any [] = [];

  isLoadingModal: boolean = false;
  addAppointmnet: boolean;
  selectInfo: any = {};
  isEdit: boolean = false;
  isReschedule: boolean = false;

  date = new Date();

  cancellationReasonLists: any [] = [];
  cancallationreason: any;

  constructor() {
    super()
   }

  async ngOnInit() {
    try {
      await super.ngOnInit()
      await this.initializeVariables()
      await this.getActivityData();
      await this.getCalendarData()
      this.getCancellationReason();
    } catch(error) {
      console.log("error", error)
    }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
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
    this.cancellationReasonLists = [];
    return;
  }

  async getActivityData() {

    var url = "appointments/staffappointmentview/filter";
    var method = "POST";

    let postData = {};

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data && data[0]) {
          this.appointmentLists = [];
          this.appointmentLists = data;

          // let obj = { id: 0, title: 'Unassign'}
          // this.resources.push(obj)

          data.forEach(element => {

            if(element && element.host && element.hostid) {
              var userObj = this.resources.find(p=>p.id == element.hostid);
              if(!userObj) {
                let obj = { id: element.hostid, title: element.host}
                this.resources.push(obj)
              }
            }
            let eventObj = { 
              id: element._id, 
              resourceId: element && element.host && element.hostid ? element.hostid : 0, 
              resourcename: element && element.host && element.hostname ? element.hostname : 0, 
              resourcetype: element && element.host && element.hostid ? element.hosttype : 0, 
              title: element?.service + ' ' + element.timeslot?.starttime+ '-' + element.timeslot?.endtime, 
              start: element.date,
              timeslot: element.timeslot,
              numbercount: element.groupsize,
              status: element.status,
              createdAt: element.createdAt,
              color: '',
              eventColor: '',
            };

            if (eventObj.status == "noshow") {
              eventObj.color = '#f57c00';
              eventObj.eventColor = '#f57c00';
            } else if (eventObj.status == "cancel") {
              eventObj.color = '#FB3E39';
              eventObj.eventColor = '#FB3E39';
            } else if (eventObj.status == "requested") {
              eventObj.color = '#3D58D4';
              eventObj.eventColor = '#3D58D4';
            } else if (eventObj.status == "confirmed") {
              eventObj.color = '#E152BF';
              eventObj.eventColor = '#E152BF';
            } else if (eventObj.status == "notstarted") {
              eventObj.color = '#47CCBF';
              eventObj.eventColor = '#47CCBF';
            } else if (eventObj.status == "inprogress") {
              eventObj.color = '#008000';
              eventObj.eventColor = '#008000';
            }
            this.events.push(eventObj)
          });
          // console.log("this.events", this.events)
          // console.log("this.resources", this.resources)
        }
      })
  }

  async getCancellationReason() {
    
    let method = "POST";
    let url = "lookups/filter";

    let postData = {};
    postData['search'] = [];
    postData['search'].push({ "searchfield": 'status', "searchvalue": "active", "criteria": "eq" });
    postData['search'].push({ "searchfield": 'lookup', "searchvalue": "cancellation reason", "criteria": "eq" });

    this._commonService
      .commonServiceByUrlMethodData(url, method, postData)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        if (data) {
          if (data && data[0] && data[0]['data']) {
            this.cancellationReasonLists = [];
            this.cancellationReasonLists = data[0]['data'];
          }
        }
      }, (error) => {
        console.error(error);
      });
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

 async handleEventClick(clickInfo: EventClickArg) {
    this.showModal = true;
    const url = "appointments/filter";
    const method = "POST";
    let postData = {};
    postData['search'] = [];
    postData['search'].push({ "searchfield": '_id', "searchvalue": clickInfo.event.id, "criteria": "eq" , "datatype" : "ObjectId" });

    this.isLoadingModal = true;

    await this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
          
          this.selectedAppointment = {};
          if (data && data.length > 0) {
            this.selectedAppointment = data[0];
            this.selectedAppointment.title = clickInfo.event.title;
            this.selectedAppointment.attendeename = data[0].attendee.fullname?data[0].attendee.fullname:data[0].attendee.title;
            
            this.date = data[0].appointmentdate;
            this.selectedAppointment.memberprofilepic = data[0].attendee && data[0].attendee.profilepic ? data[0].attendee.profilepic : './assets/img/default-avatar.png';
          } else {
            this.selectedAppointment = this.appointmentLists.find(a=>a._id == clickInfo.event.id);
            this.selectedAppointment.title = clickInfo.event.title;
            this.selectedAppointment.attendeename = this.selectedAppointment.attendee;
            this.selectedAppointment.memberprofilepic = this.selectedAppointment.attendee && this.selectedAppointment.attendee.profilepic ? this.selectedAppointment.attendee.profilepic : './assets/img/default-avatar.png';
          }
          
          this.isLoadingModal = false;
        });
  }

  hide() {
    this.showModal = false;
  }
  
  openprofile(profile: any) {
    
    if (profile.onModel=="Groupclass"){      
      this._router.navigate([]).then(result => {  window.open( `/pages/membership/class/groupclass/${profile.attendeeid}`, '_blank'); });
    } else if (profile.onModel=="Member"){      
      this._router.navigate([]).then(result => {  window.open( `/pages/members/profile/${profile.attendeeid}`, '_blank'); });
    } else {
      this._router.navigate([]).then(result => {  window.open( `/pages/customer-module/profile/${profile.attendeeid}`, '_blank'); });
    }

  }

  CancelAppointment() {
    this.showModal = false;
    this.cancallationreason = '';
  }

 async cancelAppointmentSubmit() {

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
      

      await this._commonService
        .commonServiceByUrlMethodDataAsync(url, method, postData)
        .then(async (data: any) => {
          if (data) {
            $("#cancelAppointmentCloseBtn").click();
            this.hide()
            this.calendarVisible = false;
            await this.initializeVariables()
            await this.getActivityData();
            await this.getCalendarData();
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

        return this._commonService
          .commonServiceByUrlMethodDataAsync(url, method, model,this.selectedAppointment._id)
          .then( async(data: any) => {
            if (data) {
              this.hide()
              this.calendarVisible = false;
              await this.initializeVariables()
              await this.getActivityData();
              await this.getCalendarData();
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
   

  edit() {
    console.log("this.globalfunctionpermissions",this.globalfunctionpermissions);
    this.editAppointment();
    // var modifySchedules = this.globalfunctionpermissions.includes("Modify Schedules");
    // if(modifySchedules) {
    //   this.editAppointment();
    // } else {
    //   if(this.selectedAppointment && this.selectedAppointment.host && this.selectedAppointment.host._id && (this.selectedAppointment.host._id == this._loginUserId)) {
    //     this.editAppointment();
    //   } else {
    //     swal.fire({
    //       title: "Permission Denied!",
    //       text: "You have no edit function Permission.",
    //       timer: 2000,
    //       showConfirmButton: false
    //     });
    //   }
    // }
  }
  editAppointment() {
    if(this.selectedAppointment.packageid) {
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


 async getSubmittedData(submitData: any) {

    $("#appointmentClose").click();
    this.addAppointmnet = false;
    this.calendarVisible = false;
    this.isEdit = false;
    this.isReschedule = false;
    this.selectedAppointment = {};
    await this.initializeVariables()
    await this.getActivityData();
    await this.getCalendarData()

    var $body = $(document.body);
    $body.width("auto");

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

}
