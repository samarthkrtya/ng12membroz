import { Routes, RouterModule } from '@angular/router';
import { DynamicDashboardComponent } from './dynamic-dashboard.component';

const routes: Routes = [
  { path: '', component: DynamicDashboardComponent },
  { path: ':dbid', component: DynamicDashboardComponent }
];

export const routing = RouterModule.forChild(routes);