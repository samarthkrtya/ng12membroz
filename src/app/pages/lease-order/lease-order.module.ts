import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { ModuleRoutes } from './lease-order-routing';
import { LeaseOrderComponent } from './lease-order.component';

@NgModule({
  imports: [
    RouterModule.forChild(ModuleRoutes),
  ],
  declarations: [
    LeaseOrderComponent,
  ]
})
export class LeaseOrderModule { } 