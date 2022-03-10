import { Routes, RouterModule } from '@angular/router';
import { JobActivityViewComponent } from './job-activity-view.component';

const routes: Routes = [
  { path: '', component: JobActivityViewComponent },
  { path: ':id', component: JobActivityViewComponent },
];
export const routing = RouterModule.forChild(routes);