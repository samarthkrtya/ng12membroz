import { Routes, RouterModule } from '@angular/router';
import { WeekScheduleProfileComponent } from './week-schedule-profile.component';

const routes: Routes = [
  { path: '', component: WeekScheduleProfileComponent },
  { path: ':formid', component: WeekScheduleProfileComponent },
  { path: ':formid/:id', component: WeekScheduleProfileComponent },
];
export const routing = RouterModule.forChild(routes);