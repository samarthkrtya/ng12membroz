import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './inventory-adjustment-routing';
import { InventoryAdjustmentComponent } from './inventory-adjustment.component';
import { AppMaterialModule } from '../../../../app-material/app-material.module';

import { FullCalendarModule } from '@fullcalendar/angular'; // must go before plugins
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from "@angular/material/form-field";


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
    MatInputModule,
    MatFormFieldModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    routing,
    AppMaterialModule,
    FullCalendarModule
  ],
  declarations: [
    InventoryAdjustmentComponent,
  ],
  providers: [
  ]
})
export class InventoryAdjustmentModule { }
