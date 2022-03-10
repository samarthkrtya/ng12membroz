import { Routes } from '@angular/router';

import { InventoryModuleComponent } from './inventory-module.component';

export const InventoryModuleRoutes: Routes = [
  {
    path: '', component: InventoryModuleComponent,
    children: [
      {
        path: 'inventory-adjustment',
        loadChildren: () => import('./component/inventory-adjustment/inventory-adjustment.module').then(m => m.InventoryAdjustmentModule),
      },
      
    ],
  },
];
