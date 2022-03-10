import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './season-calendar.routing';
import { SeasonCalendarComponent } from './season-calendar.component';
import { SeasonCalendarViewComponent } from './season-calendarView/season-calendarView.component';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { LookupsService } from '../../../../../../core/services/lookups/lookup.service';
import { SeasonCalendarService } from './../../../../../../core/services/adminbooking/season-calendar.service';
import { ResortLocationService } from './../../../../../../core/services/propertis/resortlocation.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    routing,
    ReactiveFormsModule,
    MatSelectModule
  ],
  declarations: [
    SeasonCalendarComponent,
    SeasonCalendarViewComponent,
  ],
  providers: [
    LookupsService,
    SeasonCalendarService,
    ResortLocationService
  ],
})
export class SeasonCalendarModule { }
