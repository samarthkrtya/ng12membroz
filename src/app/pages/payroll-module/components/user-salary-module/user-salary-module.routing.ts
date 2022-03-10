import { Routes } from '@angular/router';
import { UserSalaryModuleComponent } from './user-salary-module.component';

export const UserSalaryModuleRoutes: Routes = [
  {
    path: '', component: UserSalaryModuleComponent,
    children: [
    
      {
        path: 'payslip',
        loadChildren: () => import('./components/salary-slip-details/salary-slip-details.module').then(m => m.SalarySlipDetailsModule),
      },
      {
        path: 'detail',
        loadChildren: () => import('./components/user-salary-details/user-salary-details.module').then(m => m.UserSalaryDetailsModule),
      }
    ]
  }
];