import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './payroll-process-view-routing';
import { PayrollProcessViewComponent } from './payroll-process-view.component';

import { AppMaterialModule } from '../../../../../../app-material/app-material.module';
import { PagerService } from 'src/app/core/services/common/pager.service';
import { PayrollService } from 'src/app/core/services/payroll/payroll.service';
import { SearchPipe } from './../../search.pipe';
import { UsersService } from 'src/app/core/services/users/users.service';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    routing,
  ],
  declarations: [
    PayrollProcessViewComponent,
    SearchPipe

  ],
  providers: [
    PagerService,
    PayrollService,
    UsersService
    
  ]

})
export class PayrollProcessViewModule { }