import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MembersComponent } from './members.component';

export const MembersRoutes: Routes = [
  {
    path: '', component: MembersComponent,
    children: [
      {
        path: 'profile',
        loadChildren: () => import('./components/member-profile/member-profile.module').then(m => m.MemberProfileModule),
      },
      {
        path: 'membership-usage-summary',
        loadChildren: () => import('./components/membership-usage/membership-usage.module').then(m => m.MembershipUsageModule),
      },
      {
        path: 'visitor-punch',
        loadChildren: () => import('./components/members-visitor-punch/members-visitor-punch.module').then(m => m.MembersVisitorPunchModule),
      },
      {
        path: 'send-questionnaire',
        loadChildren: () => import('./components/send-questionnaire/send-questionnaire.module').then(m => m.SendQuestionnaireModule),
      },
      {
        path: 'conversion',
        loadChildren: () => import('./components/member-conversion-page/member-conversion-page.module').then(m => m.MemberConversionPageModule),
      }
      

    ],
  },
];