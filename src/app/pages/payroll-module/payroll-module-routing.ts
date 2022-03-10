import { Routes } from '@angular/router';
import { PayrollModuleComponent } from './payroll-module.component';

export const PayrollModuleRoutes: Routes = [
  {
    path: '', component: PayrollModuleComponent,
    children: [
      {
        path: 'attendance-module',
        loadChildren: () => import('./components/user-attendance/user-attendance.module').then(m => m.UserAttendanceComponentModule),
      },
      {
        path: 'salary-module',
        loadChildren: () => import('./components/user-salary-module/user-salary-module.module').then(m => m.UserSalaryModuleModule),
      },
      {
        path: 'timesheets',
        loadChildren: () => import('./components/user-timesheets/user-timesheets.module').then(m => m.UserTimesheetsModule),
      },
      {
        path: 'attendance',
        loadChildren: () => import('./components/user-attendance-time/user-attendance-time.module').then(m => m.UserTimeAttendanceComponentModule),
      },
      {
        path: 'attendance-weekly',
        loadChildren: () => import('./components/user-attendance-weeklycalendar/user-attendance-weeklycalendar.module').then(m => m.UserTimeAttendanceWeeklyComponentModule),
      },
      {
        path: 'payroll-settings',
        loadChildren: () => import('./components/payroll-settings/payroll-settings.module').then(m => m.PayrollSettingsComponentModule),
      },
      {
        path: 'salary-component',
        loadChildren: () => import('./components/salary-component/salary-component.module').then(m => m.SalaryComponentModule),
      },
      {
        path: 'statutory-component',
        loadChildren: () => import('./components/statutory-component/statutory-component.module').then(m => m.StatutoryComponentModule),
      },
       {
        path: 'payroll-process',
        loadChildren: () => import('./components/payroll-process/payroll-process.module').then(m => m.PayrollProcessModule),
      },
      {
        path: 'staff-roaster-module',
        loadChildren: () => import('./components/staff-roaster/staff-roaster.module').then(m => m.StaffRoasterComponentModule),
      },


    ]
  }
];
