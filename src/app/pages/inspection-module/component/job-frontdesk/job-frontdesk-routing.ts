import { Routes, RouterModule } from '@angular/router';
import { JobFrontdeskComponent } from './job-frontdesk.component';

const routes: Routes = [
  { path: '', component: JobFrontdeskComponent },
  { path: ':id', component: JobFrontdeskComponent },
];
export const routing = RouterModule.forChild(routes);