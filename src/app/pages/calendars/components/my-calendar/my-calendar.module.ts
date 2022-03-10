import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './my-calendar-routing';
import { MyCalendarComponent } from './my-calendar.component';

import { AppMaterialModule } from '../../../../app-material/app-material.module';

import { FullCalendarModule } from '@fullcalendar/angular'; // the main connector. must go first
import dayGridPlugin from '@fullcalendar/daygrid'; // a plugin
import interactionPlugin from '@fullcalendar/interaction'; // a plugin
import timeGridPlugin from '@fullcalendar/timegrid';
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid';
import { UsersService } from 'src/app/core/services/users/users.service';
import { MemberService } from 'src/app/core/services/member/member.service';

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
    FullCalendarModule,
    AppMaterialModule,
    routing,
  ],
  declarations: [
    MyCalendarComponent
  ],
  providers: [
    UsersService,
    MemberService
  ]

})
export class MyCalendarModule { }
