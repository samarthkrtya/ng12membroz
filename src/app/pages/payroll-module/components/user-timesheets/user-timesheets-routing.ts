import { Routes, RouterModule } from '@angular/router';
import { UserTimesheetsComponent } from './user-timesheets.component';

const routes: Routes = [
  { path: '', component: UserTimesheetsComponent },
  { path: ':id', component: UserTimesheetsComponent },
];
export const routing = RouterModule.forChild(routes);