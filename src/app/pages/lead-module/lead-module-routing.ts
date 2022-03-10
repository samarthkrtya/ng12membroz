import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LeadModuleComponent } from './lead-module.component';

export const LeadModuleRoutes: Routes = [
  {
    path: '', component: LeadModuleComponent,
    children: [
      { 
        path: 'profile', 
        loadChildren: () => import('./components/lead-profile/lead-profile.module').then(m => m.LeadProfileModule),
      }
    ],
  },
];