import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonService } from '../../core/services/common/common.service';
import { BaseLiteComponemntComponent } from '../base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import { CalendarOptions, DateSelectArg, EventClickArg } from '@fullcalendar/angular'; // useful for typechecking
import { Subject } from 'rxjs';

declare var $: any;
@Component({
  selector: 'app-class-schedules',
  templateUrl: './class-schedules.component.html',
  styles: [
  ]
})
export class ClassSchedulesComponent extends BaseLiteComponemntComponent implements OnInit, OnChanges {

  @Input() dataContent: any;
  @Input() bindId: any;
  @Output() onAddedScheduleData = new EventEmitter();
  @Input() reloadingStr: string;

  destroy$: Subject<boolean> = new Subject<boolean>();

  calendarVisibility: boolean = false;
  calendarOptions: CalendarOptions;
  selectedAppointment: any;
  showModal: boolean;

  workingdays: string[] = [];
  holidayLists: any[] = [];
  workinghours: any = {};
  schedule: boolean;
  actionValue: any;

  events: any[] = [];

  slotDuration: string;
  slotMinTime: string;
  slotMaxTime: string;
  height: number;
  date: Date;
  daysOfWeek: any[] = [];

  dateInfo: any = {};
  index: number;

  constructor(
    public _commonService: CommonService,
  ) {
    super();
    this.pagename = "app-class-schedules";
  }

  async ngOnInit() {
    await super.ngOnInit();
    await this.initializeVariables();
    await this.loaddata();
  }

  async ngOnChanges() {
    if (this.reloadingStr && this.reloadingStr == 'appointments') {
      if (this.dataContent.appointments) {
        await this.loaddata();
      }
    }
  }

  async initializeVariables() {

    this.actionValue = "staff";
    this.calendarVisibility = false;
    this.slotDuration = "00:15:00";
    this.slotMinTime = "00:00:00";
    this.slotMaxTime = "24:00:00";
    this.height = 1350;

    this.date = new Date();

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

        if (element == "Sunday") {
          this.daysOfWeek.push(0);
        } else if (element == "Monday") {
          this.daysOfWeek.push(1);
        } else if (element == "Tuesday") {
          this.daysOfWeek.push(2);
        } else if (element == "Wednesday") {
          this.daysOfWeek.push(3);
        } else if (element == "Thursday") {
          this.daysOfWeek.push(4);
        } else if (element == "Friday") {
          this.daysOfWeek.push(5);
        } else if (element == "Saturday") {
          this.daysOfWeek.push(6);
        } else if (element == "Sunday") {
          this.daysOfWeek.push(7);
        }
      });
    }
    this.holidayLists = [];
    this.workinghours = {};
    this.workinghours = branch.workinghours;

    this.dateInfo = {};
    this.index = 0;

    this.schedule = false;

    return;
  }


  async loaddata() {
    try {
      await this.getCalendarData();
    } catch (error) {
      console.error(error)
    }
  }

  async getCalendarData() {

    this.events = [];
    this.events = [...this.dataContent.appointments];

    this.events.forEach(element => {

      element.id = element._id;
      if (this.actionValue == "staff") {
        element.resourceId = element?.host?._id;

        var hostString = "";
        if (element && element.host && element.host.fullname) {
          hostString = " | " + element?.host?.fullname;
        }

        element.title = element?.refid?.title + hostString;

      } else {
        element.resourceId = element?.refid?._id;

        var serviceString = "";
        if (element && element.refid && element.refid.title) {
          serviceString = " | " + element?.refid?.title;
        }

        element.title = element?.host?.fullname + serviceString;
      }
      // element.title = element?.refid?.title + " " + element?.host?.fullname;
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

    if (this.slotMinTime && this.slotMaxTime && this.date) {

      this.calendarOptions = {
        initialView: 'dayGridMonth',
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'resourceTimeGridDay, timeGridWeek, dayGridMonth'
        },
        selectable: true,
        weekends: true,
        events: this.events,
        eventDisplay: 'block',

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
    $("#myModalScheduleBtn").click();
  }

  handleEventClick(clickInfo: EventClickArg) {

    this.selectedAppointment = {};
    var appointmentObj = this.dataContent.appointments.find(p => p._id == clickInfo.event.id)
    if (appointmentObj) {

      this.selectedAppointment = appointmentObj;
      this.selectedAppointment.title = clickInfo.event.title;
      this.showModal = true;
    }
  }

  async search(dateInfo: any) {

    this.dateInfo = {};
    this.dateInfo = dateInfo;

    if (this.index !== 0) {
      try {
        this.date = new Date(dateInfo.start)
        await this.getCalendarData()
      } catch (error) {
        console.log(error)
      } finally {
      }
    } else if (this.index == 0) {
      this.index++
    }
  }

  hide() {
    this.showModal = false;
  }

  addSchedule() {
    this.schedule = true;
  }

  cancel() {
    this.schedule = false;
  }

  getSubmittedData(submitData: any) {
    $("#scheduleClose").click();
    this.schedule = false;
    this.calendarVisibility = false;
    let obj = {};
    obj['tabStr'] = "appointments";
    setTimeout(() => {
      this.onAddedScheduleData.emit(obj);
    }, 1000);
  }

}
