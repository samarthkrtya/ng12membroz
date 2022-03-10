import { Routes } from '@angular/router';
import { ServiceModuleComponent } from './service-module.component';

export const ServiceModuleRoutes: Routes = [
  {
    path: '', component: ServiceModuleComponent,
    children: [
      {
        path: 'form',
        loadChildren: () => import('./components/service-form/service-form.module').then(m => m.ServiceFormModule),
      },
      {
        path: 'service-view',
        loadChildren: () => import('./components/service-view/service-view.module').then(m => m.ServiceViewModule),
      },
      {
        path: 'asset-form',
        loadChildren: () => import('./components/asset-form/asset-form.module').then(m => m.AssetFormModule),
      }
    ]
  }
];