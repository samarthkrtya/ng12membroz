import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { BookingModuleRoutes } from './booking-module-routing';
import { BookingModuleComponent } from './booking-module.component';

@NgModule({
  imports: [
    RouterModule.forChild(BookingModuleRoutes),
  ],
  declarations: [
    BookingModuleComponent,
  ]
})
export class BookingModuleModule { }