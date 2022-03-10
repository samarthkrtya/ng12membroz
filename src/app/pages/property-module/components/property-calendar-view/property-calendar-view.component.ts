import { Component, OnInit } from '@angular/core';

import { 
    BaseComponemntComponent, 
    BaseComponemntInterface 
} from '../../../../shared/base-componemnt/base-componemnt.component';


import { CalendarOptions, DateSelectArg, EventClickArg, EventDropArg } from '@fullcalendar/angular'; // useful for typechecking
import { EventResizeDoneArg } from '@fullcalendar/interaction';

@Component({
  selector: 'app-property-calendar-view',
  templateUrl: './property-calendar-view.component.html',
  styles: [
  ]
})
export class PropertyCalendarViewComponent extends BaseComponemntComponent implements OnInit, BaseComponemntInterface {

  calendarVisibility: boolean = false;
  calendarOptions: CalendarOptions;
  initialView: any = 'resourceTimelineMonth';

  constructor() { 
    super();
    this.pagename = "app-appointment-booking-calendar";
  }

  async ngOnInit() {
    try { 
      await super.ngOnInit();
      await this.initializeVariables()
      await this.getCalendarData()
    } catch(error) {
      console.error("error", error);
    } finally {
    }
  }

  LoadData() {}
  Save() {}
  Update() {}
  Delete() {}
  ActionCall() {}

  async initializeVariables() {
    this.calendarVisibility = false;
    return;
  }

  async getCalendarData() {

    this.calendarVisibility = false;

    this.calendarOptions = {
      headerToolbar: {
        left: 'today prev,next',
        center: 'title',
        right: 'resourceTimelineDay, resourceTimelineWeek, resourceTimelineMonth'
      },
      initialView: this.initialView,
      aspectRatio: 1.3,
      resourceAreaWidth: "10%",
      resourceAreaColumns: [
        { field: 'title', headerContent: 'Room' }
      ],
      resources: [
        { id: 'a', title: 'Auditorium A' },
        { id: 'b', title: 'Auditorium B' },
        { id: 'c', title: 'Auditorium C' },
        { id: 'd', title: 'Auditorium D' },
        { id: 'e', title: 'Auditorium E' },
        { id: 'f', title: 'Auditorium F' },
        { id: 'g', title: 'Auditorium G' },
        { id: 'h', title: 'Auditorium H' },
        { id: 'i', title: 'Auditorium I' },
        { id: 'j', title: 'Auditorium J' },
        { id: 'k', title: 'Auditorium K' },
        { id: 'l', title: 'Auditorium L' },
        { id: 'm', title: 'Auditorium M' },
        { id: 'n', title: 'Auditorium N' },
        { id: 'o', title: 'Auditorium O' },
        { id: 'p', title: 'Auditorium P' },
        { id: 'q', title: 'Auditorium Q' },
        { id: 'r', title: 'Auditorium R' },
        { id: 's', title: 'Auditorium S' },
        { id: 't', title: 'Auditorium T' },
        { id: 'u', title: 'Auditorium U' },
        { id: 'v', title: 'Auditorium V' },
        { id: 'w', title: 'Auditorium W' },
        { id: 'x', title: 'Auditorium X' },
        { id: 'y', title: 'Auditorium Y' },
        { id: 'z', title: 'Auditorium Z' }
      ],
      events: [
        { title  : 'event1', start  : '2022-03-07', resourceIds: ['a'] },
        { title  : 'event2', start  : '2022-03-10', end: '2022-03-15', resourceIds: ['d'] },
        { title  : 'event3', start  : '2022-03-20T12:30:00', resourceIds: ['e'], allDay : false }
      ],
      schedulerLicenseKey: 'CC-Attribution-NonCommercial-NoDerivatives',
      
    };

    this.calendarVisibility = true;
    return;
  }

}
