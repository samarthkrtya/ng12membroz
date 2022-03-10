import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './facility-booking-calendar-copy-routing';
import { FacilityBookingCalendarCopyComponent } from './facility-booking-calendar-copy.component';

import { AppMaterialModule } from '../../../../app-material/app-material.module';
import { MatOptionSelectAllModule } from '../../../../shared/mat-option-select-all/mat-option-select-all.module';

import { FacilityBookingModule } from '../../../../shared/facility-booking/facility-booking.module';
import { FacilityBookingMultipleModule } from '../../../../shared/facility-booking-multiple/facility-booking-multiple.module';

import { CommonService } from '../../../../core/services/common/common.service';

import { FullCalendarModule } from '@fullcalendar/angular'; // the main connector. must go first
import dayGridPlugin from '@fullcalendar/daygrid'; // a plugin
import interactionPlugin from '@fullcalendar/interaction'; // a plugin
import timeGridPlugin from '@fullcalendar/timegrid';
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid';

import { MAT_DATE_LOCALE} from '@angular/material/core';

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
    FormsModule,
    ReactiveFormsModule,
    FullCalendarModule,
    MatOptionSelectAllModule,
    FacilityBookingModule,
    FacilityBookingMultipleModule
  ],
  declarations: [
    FacilityBookingCalendarCopyComponent,
  ],
  exports: [
  ],
  providers :[ 
    {
      provide: MAT_DATE_LOCALE,
      deps: [CommonService],
      useFactory: ($locale: CommonService) => $locale.currentLocale()
    }
  ]
})
export class FacilityBookingCalendarCopyModule { }