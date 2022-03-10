import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SupportModuleComponent } from './support-module.component';

export const SupportModuleRoutes: Routes = [
  {
    path: '', component: SupportModuleComponent,
    children: [
      {
        path: 'tickets',
        loadChildren: () => import('./components/support-ticket/support-ticket.module').then(m => m.SupportTicketModule),
      },
      {
        path: 'create-tickets',
        loadChildren: () => import('./components/create-ticket/create-ticket.module').then(m => m.CreateSupportModule),
      },
      {
        path: 'getting-started',
        loadChildren: () => import('./components/getting-started/getting-started.module').then(m => m.GettingStartedModule),
      }
    ],
  },
];