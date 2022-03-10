import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './salary-slip-details.routing';
import { AppMaterialModule } from '../../../../../../app-material/app-material.module';
import { UsersService } from 'src/app/core/services/users/users.service';
import { PagerService } from 'src/app/core/services/common/pager.service';
import { PayrollService } from 'src/app/core/services/payroll/payroll.service';
import { SalarySlipDetailsComponent } from './salary-slip-details.component';
import { SafeHtmlPipe } from './safehtml.pipe';
import { ItemListModule } from 'src/app/shared/item-list/item-list.module';
import { DynamicPreviewListComponent } from 'src/app/pages/dynamic-preview-list/dynamic-preview-list.component';
import { MoreActionBtnComponent } from 'src/app/pages/dynamic-preview-list/more-action-btn/more-action-btn.component';
import { PreviewComponent } from 'src/app/pages/dynamic-preview-list/preview/preview.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ItemListModule,
    AppMaterialModule,
    routing,
  ],
  declarations: [
    SalarySlipDetailsComponent,
    SafeHtmlPipe,

  ],
  providers: [
UsersService,
PagerService,
PayrollService
  ]

})
export class SalarySlipDetailsModule { }


