import { Routes, RouterModule } from '@angular/router';
import { SalaryComponentComponent } from './salary-component.component';

const routes: Routes = [
  { path: '', component: SalaryComponentComponent },
  { path: ':id', component: SalaryComponentComponent },
];
export const routing = RouterModule.forChild(routes);