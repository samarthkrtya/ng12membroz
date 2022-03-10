import { Routes, RouterModule } from '@angular/router';
import { JobUsageViewComponent } from './job-usage-view.component';

const routes: Routes = [
  { path: '', component: JobUsageViewComponent },
  { path: ':id', component: JobUsageViewComponent },
];
export const routing = RouterModule.forChild(routes);