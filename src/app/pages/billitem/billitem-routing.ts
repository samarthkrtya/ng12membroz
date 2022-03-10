import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BillitemComponent } from './billitem.component';

export const BillitemRoutes: Routes = [
  {
    path: '', component: BillitemComponent,
    children: [
     
      { 
        path: 'billitem-template', 
        loadChildren: () => import('./components/billitem-template/billitem-template.module').then(m => m.BillitemTemplateModule),
      },
      
     
      
    ],
  },
];