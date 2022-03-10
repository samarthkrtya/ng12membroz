import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FormdataComponent } from './formdata.component';

export const FormdataRoutes: Routes = [
  {
    path: '', component: FormdataComponent,
    children: [
      {
        path: 'view',
        loadChildren: () => import('./components/formdata-detail/formdata-detail.module').then(m => m.FormdataDetailModule),
      },
    ],
  },
];