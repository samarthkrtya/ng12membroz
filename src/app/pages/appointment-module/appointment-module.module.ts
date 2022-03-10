import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AppointmentModuleRoutes } from './appointment-module-routing';
import { AppointmentModuleComponent } from './appointment-module.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AppointmentModuleRoutes),
  ],
  declarations: [
    AppointmentModuleComponent
  ],
})
export class AppointmentModuleModule { }
