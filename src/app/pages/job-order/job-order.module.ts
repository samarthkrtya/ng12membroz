import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { ModuleRoutes } from './job-order-routing';
import { JobOrderComponent } from './job-order.component';

@NgModule({
  imports: [
    RouterModule.forChild(ModuleRoutes),
  ],
  declarations: [
    JobOrderComponent,
  ]
})
export class JobOrderModule { }