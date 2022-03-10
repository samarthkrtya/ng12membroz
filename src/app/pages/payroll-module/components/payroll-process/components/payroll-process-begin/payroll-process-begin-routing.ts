import { Routes, RouterModule } from '@angular/router';
import { PayrollProcessBeginComponent } from './payroll-process-begin.component';

 const routes: Routes = [
  { path: '', component: PayrollProcessBeginComponent},
  { path: ':id',component:PayrollProcessBeginComponent}
];
export const routing = RouterModule.forChild(routes); 


