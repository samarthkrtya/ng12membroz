import { Routes, RouterModule } from '@angular/router';
import { StaffUsageViewComponent } from './staff-usage-view.component';

const routes: Routes = [
  { path: '', component: StaffUsageViewComponent },
  { path: ':id', component: StaffUsageViewComponent },
];
export const routing = RouterModule.forChild(routes);