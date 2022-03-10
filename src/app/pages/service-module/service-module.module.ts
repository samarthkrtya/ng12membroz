import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { ServiceModuleRoutes } from './service-module-routing';
import { ServiceModuleComponent } from './service-module.component';

@NgModule({
  imports: [
    RouterModule.forChild(ServiceModuleRoutes),
  ],
  declarations: [
    ServiceModuleComponent,
  ]
})
export class ServiceModuleModule { }