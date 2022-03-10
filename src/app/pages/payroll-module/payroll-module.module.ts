import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { PayrollModuleRoutes } from './payroll-module-routing';
import { PayrollModuleComponent } from './payroll-module.component';

@NgModule({
  imports: [
    RouterModule.forChild(PayrollModuleRoutes),
  ],
  declarations: [
    PayrollModuleComponent,
    
  ]
})
export class PayrollModuleModule { }