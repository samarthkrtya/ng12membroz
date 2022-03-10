import { Routes, RouterModule } from '@angular/router';
import { UserAttendanceTimeComponent } from './user-attendance-time.component';

const routes: Routes = [
  { path: '', component: UserAttendanceTimeComponent},
  { path: ':id', component: UserAttendanceTimeComponent },
  
];
export const routing = RouterModule.forChild(routes);