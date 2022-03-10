import { Routes, RouterModule } from '@angular/router';
import { PayrollProcessViewComponent } from './payroll-process-view.component';

const routes: Routes = [
  { path: '', component: PayrollProcessViewComponent },
  { path: ':id', component: PayrollProcessViewComponent },
];
export const routing = RouterModule.forChild(routes);