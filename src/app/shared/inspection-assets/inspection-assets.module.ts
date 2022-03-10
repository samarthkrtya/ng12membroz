import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { InspectionAssetsComponent } from './inspection-assets.component';
import { AppMaterialModule } from '../../app-material/app-material.module';
import { InspectionAddAssetsComponent } from './components/inspection-add-assets/inspection-add-assets.component';
import { InspectionScheduleAssetsComponent } from './components/inspection-schedule-assets/inspection-schedule-assets.component';
import { InspectionJobStatusChangeComponent } from './components/inspection-job-status-change/inspection-job-status-change.component';

import { MAT_DATE_LOCALE } from '@angular/material/core'; 
import { FullCalendarModule } from '@fullcalendar/angular'; // the main connector. must go first
import dayGridPlugin from '@fullcalendar/daygrid'; // a plugin
import interactionPlugin from '@fullcalendar/interaction'; // a plugin
import timeGridPlugin from '@fullcalendar/timegrid';
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid';

import { CommonService } from '../../core/services/common/common.service';
import { InspectionVehicleSelectComponent } from './components/inspection-vehicle-select/inspection-vehicle-select.component';


FullCalendarModule.registerPlugins([ // register FullCalendar plugins
  dayGridPlugin,
  interactionPlugin,
  timeGridPlugin,
  resourceTimeGridPlugin
]);

@NgModule({
  imports: [
    CommonModule,
    AppMaterialModule,
    FormsModule,
    ReactiveFormsModule,
    FullCalendarModule,
  ],
  declarations: [
    InspectionAssetsComponent,
    InspectionAddAssetsComponent,
    InspectionScheduleAssetsComponent,
    InspectionVehicleSelectComponent,
    InspectionJobStatusChangeComponent
  ],
  exports: [
    InspectionAssetsComponent,
    InspectionAddAssetsComponent,
    InspectionScheduleAssetsComponent,
    InspectionVehicleSelectComponent,
    InspectionJobStatusChangeComponent
  ],
  providers: [
    {
      provide: MAT_DATE_LOCALE,
      deps: [CommonService],
      useFactory: ($locale: CommonService) => $locale.currentLocale()
    }
  ]
})
export class InspectionAssetsModule { }
