import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CampaignModuleComponent } from './campaign-module.component';

export const CampaignModuleRoutes: Routes = [
  {
    path: '', component: CampaignModuleComponent,
    children: [
      { 
        path: 'profile', 
        loadChildren: () => import('./components/campaign-profile/campaign-profile.module').then(m => m.CampaignProfileModule),
      }
    ],
  },
];