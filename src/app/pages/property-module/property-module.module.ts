import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { PropertyModuleRoutes } from './property-module-routing';
import { PropertyModuleComponent } from './property-module.component';

@NgModule({
  imports: [
    RouterModule.forChild(PropertyModuleRoutes),
  ],
  declarations: [
    PropertyModuleComponent,
  ]
})
export class PropertyModuleModule { }