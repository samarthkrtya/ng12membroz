import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { PPayrollProcessRoutes } from './payroll-process-routing';
import { PayrollProcessComponent } from './payroll-process.component';


@NgModule({
  imports: [
    RouterModule.forChild(PPayrollProcessRoutes),
  ],
  declarations: [
    PayrollProcessComponent,
  ]
})
export class PayrollProcessModule { }