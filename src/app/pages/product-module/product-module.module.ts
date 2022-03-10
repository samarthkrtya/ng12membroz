import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { ProductModuleRoutes } from './product-module-routing';
import { ProductModuleComponent } from './product-module.component';

@NgModule({
  imports: [
    RouterModule.forChild(ProductModuleRoutes),
  ],
  declarations: [
    ProductModuleComponent,
  ]
})
export class ProductModuleModule { }