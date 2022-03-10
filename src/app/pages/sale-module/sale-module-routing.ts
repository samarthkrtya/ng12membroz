import { Routes } from '@angular/router';
import { SaleModuleComponent } from './sale-module.component';

export const SaleModuleRoutes: Routes = [
  {
    path: '', component: SaleModuleComponent,
    children: [
      {
        path: 'manage-sales',
        loadChildren: () => import('./components/manage-sales/manage-sales.module').then(m => m.ManageSalesModule),
      },
      {
        path: 'sales-estimate',
        loadChildren: () => import('./components/sales-estimate/sales-estimate.module').then(m => m.SalesEstimateModule),
      },
      {
        path: 'sales-order',
        loadChildren: () => import('./components/sales-order/sales-order.module').then(m => m.SalesOrderModule),
      },
      {
        path: 'manage-stock',
        loadChildren: () => import('./components/manage-stock/manage-stock.module').then(m => m.ManageStockModule),
      },
      {
        path: 'multiple-bill',
        loadChildren: () => import('./components/multiple-bill/multiple-bill.module').then(m => m.MultipleBillModule),
      },


    ]
  }
];