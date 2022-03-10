import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { InspectionModuleRoutes } from './inspection-module-routing';
import { InspectionModuleComponent } from './inspection-module.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(InspectionModuleRoutes),
  ],
  declarations: [
    InspectionModuleComponent
  ],
})
export class InspectionModuleModule { }

