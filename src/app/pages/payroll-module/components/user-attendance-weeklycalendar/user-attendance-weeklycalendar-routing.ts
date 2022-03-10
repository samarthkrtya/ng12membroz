import { Routes, RouterModule } from '@angular/router';
import { UserAttendanceTimeWeeklyComponent } from './user-attendance-weeklycalendar.component';

const routes: Routes = [
  { path: '', component: UserAttendanceTimeWeeklyComponent},
  { path: ':id', component: UserAttendanceTimeWeeklyComponent },

];
export const routing = RouterModule.forChild(routes);
