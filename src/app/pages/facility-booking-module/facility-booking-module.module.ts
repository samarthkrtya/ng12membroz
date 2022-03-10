import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AppointmentModuleRoutes } from './facility-booking-module-routing';
import { FacilityBookingModuleComponent } from './facility-booking-module.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AppointmentModuleRoutes),
  ],
  declarations: [
    FacilityBookingModuleComponent
  ],
})
export class FacilityBookingModuleModule { }
