import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './staff-usage-view-routing';
import { StaffUsageViewComponent } from './staff-usage-view.component';
import { AppMaterialModule } from '../../../../app-material/app-material.module';
import { AppointmentBookingModule } from '../../../../shared/appointment-booking/appointment-booking.module';

import { FullCalendarModule } from '@fullcalendar/angular'; // must go before plugins


import dayGridPlugin from '@fullcalendar/daygrid'; // a plugin
import interactionPlugin from '@fullcalendar/interaction'; // a plugin
import timeGridPlugin from '@fullcalendar/timegrid';
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid';

import timeLinePlugin from '@fullcalendar/timeline';
import resourceTimeLinePlugin from '@fullcalendar/resource-timeline';
import resourceDayGridPlugin from '@fullcalendar/resource-daygrid';

FullCalendarModule.registerPlugins([ // register FullCalendar plugins
  dayGridPlugin,
  interactionPlugin,
  timeGridPlugin,
  resourceTimeGridPlugin,
  timeLinePlugin,
  resourceTimeLinePlugin,
  resourceDayGridPlugin
]);

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    routing,
    AppMaterialModule,
    FullCalendarModule,
    AppointmentBookingModule,
  ],
  declarations: [
    StaffUsageViewComponent,
  ],
  providers: [
  ]
})
export class StaffUsageViewModule { }
