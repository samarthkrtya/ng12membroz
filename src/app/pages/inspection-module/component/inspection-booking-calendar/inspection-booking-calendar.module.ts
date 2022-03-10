import { CommonModule, DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModule } from 'src/app/app-material/app-material.module';
import { ItemListModule } from 'src/app/shared/item-list/item-list.module';
import { SharedModule } from 'src/app/shared/shared.module';

import { routing } from './inspection-booking-calendar-routing';
import { InspectionBookingCalendarComponent } from './inspection-booking-calendar.component';

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
    ItemListModule,
    routing,
    SharedModule,
    FullCalendarModule,
  ],
  declarations: [
    InspectionBookingCalendarComponent,
  ],
  exports: [ 
  ],
  providers: [
    DatePipe
  ]
})
export class  InspectionBookingCalendarModule { }


