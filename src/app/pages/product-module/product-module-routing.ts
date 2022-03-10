import { Routes } from '@angular/router';
import { ProductModuleComponent } from './product-module.component';

export const ProductModuleRoutes: Routes = [
  {
    path: '', component: ProductModuleComponent,
    children: [
      {
        path: 'form',
        loadChildren: () => import('./components/product-form/product-form.module').then(m => m.ProductFormModule),
      },
      {
        path: 'view',
        loadChildren: () => import('./components/product-view/product-view.module').then(m => m.ProductViewModule),
      }
    ]
  }
];