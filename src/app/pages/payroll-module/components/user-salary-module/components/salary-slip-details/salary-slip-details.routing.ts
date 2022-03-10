import { Routes, RouterModule } from '@angular/router';
import { SalarySlipDetailsComponent } from './salary-slip-details.component';

 const routes: Routes = [
  { path: '', component: SalarySlipDetailsComponent},
  { path: ':id',component:SalarySlipDetailsComponent}
];
export const routing = RouterModule.forChild(routes); 


