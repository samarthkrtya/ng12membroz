import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WeekScheduleModuleComponent } from './week-schedule-module.component';

export const WeekScheduleModulesRoutes: Routes = [
  {
    path: '', component: WeekScheduleModuleComponent,
    children: [
      {
        path: 'profile',
        loadChildren: () => import('./components/week-schedule-profile/week-schedule-profile.module').then(m => m.WeekScheduleProfileModule),
      },
    ],
  },
];