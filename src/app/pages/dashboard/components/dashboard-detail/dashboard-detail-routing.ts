import { Routes, RouterModule } from '@angular/router';
import { DashboardDetailComponent } from './dashboard-detail.component';

const routes: Routes = [
  { path: '', component: DashboardDetailComponent },
  { path: ':id', component: DashboardDetailComponent },
];
export const routing = RouterModule.forChild(routes);