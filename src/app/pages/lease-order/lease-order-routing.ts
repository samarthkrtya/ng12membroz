import { Routes } from '@angular/router';
import { LeaseOrderComponent } from './lease-order.component';

export const ModuleRoutes: Routes = [
  {
    path: '', component: LeaseOrderComponent,
    children: [
      {
        path: 'frontdesk',
        loadChildren: () => import('./components/lease-frontdesk/lease-frontdesk.module').then(m => m.LeaseFrontdeskModule),
      },

    ]
  }
];