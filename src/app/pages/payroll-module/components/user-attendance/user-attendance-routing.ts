import { Routes, RouterModule } from '@angular/router';
import { UserAttendanceComponent } from './user-attendance.component';

const routes: Routes = [
  { path: '', component: UserAttendanceComponent},
  { path: ':id', component: UserAttendanceComponent },
  
];
export const routing = RouterModule.forChild(routes);