import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CustomerModuleComponent } from './customer-module.component';

export const CustomerModuleRoutes: Routes = [
  {
    path: '', component: CustomerModuleComponent,
    children: [
      { 
        path: 'profile', 
        loadChildren: () => import('./components/customer-profile/customer-profile.module').then(m => m.CustomerProfileModule),
      },
      {
        path: 'customer-usage-summary',
        loadChildren: () => import('./components/customer-usage/customer-usage.module').then(m => m.CustomerUsageModule),
      },
      { 
        path: 'conversion', 
        loadChildren: () => import('./components/customer-conversion/customer-conversion.module').then(m => m.CustomerConversionModule),
      },
      
    ],
  },
];