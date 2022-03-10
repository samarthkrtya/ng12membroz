import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { ClassSchedulesComponent } from './class-schedules.component';
import { ScheduleMultipleComponent } from './schedule-multiple/schedule-multiple.component';
import { DynamicStaffListsComponent  } from './schedule-multiple/dynamic-staff-lists/dynamic-staff-lists.component';
import { DynamicResourceListsComponent } from './schedule-multiple/dynamic-resource-lists/dynamic-resource-lists.component';

import { DynamicAutocompleteModule } from '../dynamic-autocomplete/dynamic-autocomplete.module';
import { AppMaterialModule } from '../../app-material/app-material.module';
import { SharedModule } from '../shared.module';
import { FullCalendarModule } from '@fullcalendar/angular';
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
    DynamicAutocompleteModule,
    AppMaterialModule,
    SharedModule,
    HttpClientModule,
    FullCalendarModule
  ],
  declarations: [
    ClassSchedulesComponent,
    ScheduleMultipleComponent,
    DynamicStaffListsComponent,
    DynamicResourceListsComponent
  ],
  exports: [
    ClassSchedulesComponent,
    ScheduleMultipleComponent,
    DynamicStaffListsComponent,
    DynamicResourceListsComponent
  ],
  providers: [
   
  ]
  
})
export class ClassSchedulesModule { }
