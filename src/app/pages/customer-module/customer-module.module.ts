import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { CustomerModuleRoutes  } from './customer-module-routing';
import { CustomerModuleComponent } from './customer-module.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(CustomerModuleRoutes),
  ],
  declarations: [
    CustomerModuleComponent
  ],
})
export class CustomerModuleModule { }