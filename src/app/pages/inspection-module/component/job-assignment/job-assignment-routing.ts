import { Routes, RouterModule } from '@angular/router';
import { JobAssignmentComponent } from './job-assignment.component';

const routes: Routes = [
  { path: '', component: JobAssignmentComponent },
  { path: ':id', component: JobAssignmentComponent },
];
export const routing = RouterModule.forChild(routes);