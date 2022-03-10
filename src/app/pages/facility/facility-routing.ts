import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FacilityComponent } from './facility.component';

export const FacilityRoutes: Routes = [
  {
    path: '', component: FacilityComponent,
    children: [
      {
        path: 'detail',
        loadChildren: () => import('./components/facility-detail/facility-detail.module').then(m => m.FacilityDetailModule),
      },
      // {
      //   path: 'usage-view',
      //   loadChildren: () => import('./components/facility-usage-view/facility-usage-view.module').then(m => m.FacilityUsageViewModule),
      // },
      
     /*  {
        path: 'membership-usage-summary',
        loadChildren: () => import('./components/membership-usage/membership-usage.module').then(m => m.MembershipUsageModule),
      },
      {
        path: 'visitor-punch',
        loadChildren: () => import('./components/members-visitor-punch/members-visitor-punch.module').then(m => m.MembersVisitorPunchModule),
      } */

    ],
  },
];