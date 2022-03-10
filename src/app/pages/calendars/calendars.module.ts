import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { CalendarRoutes } from './calendars.routing';
import { CalendarsComponent } from './calendars.component';

@NgModule({
  imports: [
    RouterModule.forChild(CalendarRoutes),
  ],
  declarations: [
    CalendarsComponent,
  ]
})
export class CalendarsModule { }