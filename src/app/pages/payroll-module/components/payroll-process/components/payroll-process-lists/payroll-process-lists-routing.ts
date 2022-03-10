import { Routes, RouterModule } from '@angular/router';
import { PayrollProcessListsComponent } from './payroll-process-lists.component';

const routes: Routes = [
  { path: '', component: PayrollProcessListsComponent },
  { path: ':id', component: PayrollProcessListsComponent },
];
export const routing = RouterModule.forChild(routes);