import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AvailabilityCalendarComponent } from './availability-calendar.component';
import { CalendarConfigurationComponent } from './components/calendar-configuration/calendar-configuration.component';
import { ExceptionCalendarComponent } from './components/exception-calendar/exception-calendar.component';
import { FacilitybookingavailabilityComponent } from './components/facilitybookingavailability/facilitybookingavailability.component';

import { DynamicAutocompleteModule } from '../../shared/dynamic-autocomplete/dynamic-autocomplete.module';
import { AppMaterialModule } from '../../app-material/app-material.module';

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

import { CommonService  } from '../../core/services/common/common.service';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { UseravailabilityComponent } from './components/useravailability/useravailability.component';
import { SharedModule } from '../shared.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    DynamicAutocompleteModule,
    AppMaterialModule,
    FullCalendarModule,
    SharedModule
  ],
  declarations: [
    AvailabilityCalendarComponent,
    CalendarConfigurationComponent,
    ExceptionCalendarComponent,
    FacilitybookingavailabilityComponent,
    UseravailabilityComponent, 
  ],
  exports:[
    CalendarConfigurationComponent,
    ExceptionCalendarComponent,
    FacilitybookingavailabilityComponent,
    UseravailabilityComponent
  ],
  providers: [
    CommonService,
    {
      provide: MAT_DATE_LOCALE,
      deps: [CommonService],
      useFactory: ($locale: CommonService) => $locale.currentLocale()
    }
  ]
})
export class AvailabilityCalendarModule { }
