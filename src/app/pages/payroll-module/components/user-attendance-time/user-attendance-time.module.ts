import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { routing } from './user-attendance-time-routing';
import { UserAttendanceTimeComponent } from './user-attendance-time.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid'; // a plugin
import interactionPlugin from '@fullcalendar/interaction'; // a plugin
import timeGridPlugin from '@fullcalendar/timegrid';
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { MatNativeDateModule } from '@angular/material/core';
import { MomentDateModule } from '@angular/material-moment-adapter';
import { SharedModule } from 'src/app/shared/shared.module';
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
    routing,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    FullCalendarModule,
    MatButtonToggleModule,
    MatNativeDateModule,
    MomentDateModule,
    SharedModule,
  ],
  declarations: [
    UserAttendanceTimeComponent
  ],
  providers: [
    DatePipe
  ]

})
export class UserTimeAttendanceComponentModule { }


