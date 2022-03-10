import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './appointment-booking-calendar-routing';
import { AppointmentBookingCalendarComponent } from './appointment-booking-calendar.component';
import { SharedModule } from '../../../../shared/shared.module';
import { AppMaterialModule } from '../../../../app-material/app-material.module';
import { MatOptionSelectAllModule } from '../../../../shared/mat-option-select-all/mat-option-select-all.module';

import { AppointmentBookingModule } from '../../../../shared/appointment-booking/appointment-booking.module';
import { DynamicAutocompleteModule } from '../../../../shared/dynamic-autocomplete/dynamic-autocomplete.module';

import { CommonService } from '../../../../core/services/common/common.service';

import { MAT_DATE_LOCALE } from '@angular/material/core'; 
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
    routing,
    AppMaterialModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    FullCalendarModule,
    MatOptionSelectAllModule,
    AppointmentBookingModule,
    DynamicAutocompleteModule
  ],
  declarations: [
    AppointmentBookingCalendarComponent,
  ],
  exports: [
  ],
  providers: [
    {
      provide: MAT_DATE_LOCALE,
      deps: [CommonService],
      useFactory: ($locale: CommonService) => $locale.currentLocale()
    }
  ]
})
export class AppointmentBookingCalendarModule { }