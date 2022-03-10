import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './user-salary-details.routing';
import { AppMaterialModule } from '../../../../../../app-material/app-material.module';
import { UsersService } from 'src/app/core/services/users/users.service';
import { PagerService } from 'src/app/core/services/common/pager.service';
import { PayrollService } from 'src/app/core/services/payroll/payroll.service';
import { UserSalaryDetailsComponent } from './user-salary-details.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    routing,
  ],
  declarations: [
    UserSalaryDetailsComponent,
  ],
  providers: [
UsersService,
PagerService,
PayrollService
  ]

})
export class UserSalaryDetailsModule { }


