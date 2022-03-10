import { Routes, RouterModule } from '@angular/router';
import { UserSalaryDetailsComponent } from './user-salary-details.component';

 const routes: Routes = [
  { path: '', component: UserSalaryDetailsComponent},
  { path: ':id',component:UserSalaryDetailsComponent}
];
export const routing = RouterModule.forChild(routes); 


