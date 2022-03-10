import { Routes, RouterModule } from '@angular/router';
import { HolidayCalendarComponent } from './holiday-calendar.component';

 
const routes: Routes = [
  { path: '', component: HolidayCalendarComponent },
  { path: ':id', component: HolidayCalendarComponent },
];

export const routing = RouterModule.forChild(routes);
