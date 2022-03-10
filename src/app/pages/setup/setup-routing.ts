import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SetupComponent } from './setup.component';

export const SetupRoutes: Routes = [
  {
    path: '', component: SetupComponent,
    children: [
      { 
        path: 'form-fields', 
        loadChildren: () => import('./components/form-fields/form-fields.module').then(m => m.FormFieldsModule),
      },
      { 
        path: 'lookup', 
        loadChildren: () => import('./components/lookup/lookup.module').then(m => m.LookupModule),
      },
      { 
        path: 'ip-config', 
        loadChildren: () => import('./components/ip-config/ip-config.module').then(m => m.IPConfigModule),
      }
    ],
  },
];