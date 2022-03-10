import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { PaymentModuleRoutes } from './event-routing';
import { EventComponent } from './event.component';

@NgModule({
  imports: [
    RouterModule.forChild(PaymentModuleRoutes),
  ],
  declarations: [
    EventComponent,
  ]
})
export class EventModule { }
