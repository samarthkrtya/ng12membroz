import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { UserSalaryModuleComponent } from './user-salary-module.component';
import { UserSalaryModuleRoutes } from './user-salary-module.routing';
import { UserSalaryDetailsComponent } from './components/user-salary-details/user-salary-details.component';
import { SalarySlipDetailsComponent } from './components/salary-slip-details/salary-slip-details.component';


@NgModule({
  imports: [
    RouterModule.forChild(UserSalaryModuleRoutes),
  ],
  declarations: [
    UserSalaryModuleComponent,
  ]
})
export class UserSalaryModuleModule { }