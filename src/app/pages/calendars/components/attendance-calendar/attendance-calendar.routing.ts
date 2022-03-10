import { Routes, RouterModule } from '@angular/router';
import { AttendanceCalendarComponent } from './attendance-calendar.component';

 
const routes: Routes = [
  { path: '', component: AttendanceCalendarComponent },
  { path: ':id', component: AttendanceCalendarComponent },
];

export const routing = RouterModule.forChild(routes);
