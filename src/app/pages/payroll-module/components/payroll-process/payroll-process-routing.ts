import { Routes } from '@angular/router';
import { PayrollProcessComponent } from './payroll-process.component';

export const PPayrollProcessRoutes: Routes = [
  {
    path: '', component: PayrollProcessComponent,
    children: [
     /*  {
        path: 'begin',
        loadChildren: () => import('./components/payroll-process-begin/payroll-process-begin.module').then(m => m.PayrollProcessBeginModule),
      }, */
      {
        path: 'lists',
        loadChildren: () => import('./components/payroll-process-lists/payroll-process-lists.module').then(m => m.PayrollProcessListsModule),
      },
      {
        path: 'view',
        loadChildren: () => import('./components/payroll-process-view/payroll-process-view.module').then(m => m.PayrollProcessViewModule),
      },
      {
        path: 'begin',
        loadChildren: () => import('./components/payroll-process-begin/payroll-process-begin.module').then(m => m.PayrollProcessBeginModule),
      }
    ]
  }
];