import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { VendorModuleRoutes  } from './vendor-module-routing';
import { VendorModuleComponent } from './vendor-module.component';


@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(VendorModuleRoutes),
  ],
  declarations: [
    VendorModuleComponent
  ],
})
export class VendorModuleModule { }