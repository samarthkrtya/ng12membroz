import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DispositionModuleComponent } from './disposition-module.component';

export const DispositionModuleModuleRoutes: Routes = [
  {
    path: '', component: DispositionModuleComponent,
    children: [
      { 
        path: 'form', 
        loadChildren: () => import('./components/form-disposition/form-disposition.module').then(m => m.FormDispositionModule),
      }
    ],
  },
];