import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { PaymentModuleRoutes } from './payment-module-routing';
import { PaymentModuleComponent } from './payment-module.component';

@NgModule({
  imports: [
    RouterModule.forChild(PaymentModuleRoutes),
  ],
  declarations: [
    PaymentModuleComponent,
  ]
})
export class PaymentModuleModule { }
