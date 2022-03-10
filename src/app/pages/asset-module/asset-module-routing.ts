import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AssetModuleComponent } from './asset-module.component';

export const AssetModuleRoutes: Routes = [
  {
    path: '', component: AssetModuleComponent,
    children: [
      {
        path: 'profile',
        loadChildren: () => import('./components/asset-profile/asset-profile.module').then(m => m.AssetProfileModule),
      },
      {
        path: 'vehicle-profile',
        loadChildren: () => import('./components/vehicle-profile/vehicle-profile.module').then(m => m.VehicleProfileModule),
      }
      
    ],
  },
];