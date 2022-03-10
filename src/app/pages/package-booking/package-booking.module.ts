import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { PaymentModuleRoutes } from './package-booking-routing';
import { PackageBookingComponent } from './package-booking.component';

@NgModule({
  imports: [
    RouterModule.forChild(PaymentModuleRoutes),
  ],
  declarations: [
    PackageBookingComponent,
  ]
})
export class PackageBookingModule { }
