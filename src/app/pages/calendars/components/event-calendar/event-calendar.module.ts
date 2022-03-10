import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './event-calendar-routing';
import { EventCalendarComponent } from './event-calendar.component';

import { AppMaterialModule } from '../../../../app-material/app-material.module';
import { EventService } from '../../../../core/services/event/event.service';

import { FullCalendarModule } from '@fullcalendar/angular'; // the main connector. must go first
import dayGridPlugin from '@fullcalendar/daygrid'; // a plugin
import interactionPlugin from '@fullcalendar/interaction'; // a plugin
import timeGridPlugin from '@fullcalendar/timegrid';
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid';


FullCalendarModule.registerPlugins([ // register FullCalendar plugins
  dayGridPlugin,
  interactionPlugin,
  timeGridPlugin,
  resourceTimeGridPlugin
]);

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    FullCalendarModule,
    routing,
  ],
  declarations: [
    EventCalendarComponent
  ],
  providers: [
    EventService
  ]

})
export class EventCalendarModule { }
