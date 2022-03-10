import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { PurchaseModuleRoutes } from './purchase-module-routing';
import { PurchaseModuleComponent } from './purchase-module.component';

@NgModule({
  imports: [
    RouterModule.forChild(PurchaseModuleRoutes),
  ],
  declarations: [
    PurchaseModuleComponent,
  ]
})
export class PurchaseModuleModule { }


