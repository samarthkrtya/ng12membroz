import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './property-calendar-view-routing';
import { PropertyCalendarViewComponent } from './property-calendar-view.component';

import { AppMaterialModule } from '../../../../app-material/app-material.module';
import { SharedModule } from '../../../../shared/shared.module';

import { FullCalendarModule } from '@fullcalendar/angular'; // the main connector. must go first
import dayGridPlugin from '@fullcalendar/daygrid'; // a plugin
import interactionPlugin from '@fullcalendar/interaction'; // a plugin
import timeGridPlugin from '@fullcalendar/timegrid';
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';

import { MAT_DATE_LOCALE } from '@angular/material/core'; 
import { CommonService } from '../../../../core/services/common/common.service';

FullCalendarModule.registerPlugins([ // register FullCalendar plugins
  dayGridPlugin,
  interactionPlugin,
  timeGridPlugin,
  resourceTimeGridPlugin,
  resourceTimelinePlugin
]);
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    routing,
    SharedModule,
    FullCalendarModule,
  ],
  declarations: [
    PropertyCalendarViewComponent
  ],
  providers: [
    {
      provide: MAT_DATE_LOCALE,
      deps: [CommonService],
      useFactory: ($locale: CommonService) => $locale.currentLocale()
    }
  ]

})
export class PropertyCalendarViewModule { }
