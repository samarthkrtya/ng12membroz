import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './role-detail-routing';
import { RoleDetailComponent } from './role-detail.component';

import { AppMaterialModule } from '../../../../app-material/app-material.module';
import { ItemListModule } from '../../../../shared/item-list/item-list.module'
import { PaymentItemService } from '../../../../core/services/payment/paymentitem.service';
import { TaxesService } from '../../../../core/services/payment/taxes.service';
import { PaymentTermsService } from '../../../../core/services/payment/paymentterm.service';
import { TreeChecklistModule } from '../../../../shared/tree-checklist/tree-checklist.module';
import { SharedModule } from '../../../../shared/shared.module';
import { UsersService } from 'src/app/core/services/users/users.service';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatExpansionModule} from '@angular/material/expansion';
import { RoleBasicDetailsComponent } from './role-basic-details/role-basic-details.component';
import { RoleMenuPermissionComponent } from './role-menu-permission/role-menu-permission.component';
import { RoleRecordPermissionComponent } from './role-record-permission/role-record-permission.component';
import { RoleReportPermissionComponent } from './role-report-permission/role-report-permission.component';
import {MatTreeModule} from '@angular/material/tree';
import { ReportsService } from 'src/app/core/services/reports/reports.service';
import {MatChipsModule} from '@angular/material/chips';
import { PagerService } from 'src/app/core/services/common/pager.service';
import { SearchPipe } from './search.pipe';
import { RoleDispositionPermissionComponent } from './role-disposition-permission/role-disposition-permission.component';
import { RoleBireportPermissionComponent } from './role-bireport-permission/role-bireport-permission.component';
import { RoleFunctionPermissionComponent } from './role-function-permission/role-function-permission.component';
import { FunctionRolePermissionComponent } from './function-role-permission/function-role-permission.component';





@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    routing,
    AppMaterialModule,
    ItemListModule,
    TreeChecklistModule,
    SharedModule,
    MatSlideToggleModule,
    MatExpansionModule,
    MatTreeModule,
    MatChipsModule
  ],
  declarations: [
    RoleDetailComponent,
    RoleBasicDetailsComponent,
    RoleMenuPermissionComponent,
    RoleRecordPermissionComponent,
    RoleReportPermissionComponent,
    SearchPipe,
    RoleDispositionPermissionComponent,
    RoleBireportPermissionComponent,
    RoleFunctionPermissionComponent,
    FunctionRolePermissionComponent
  ],
  providers: [
    UsersService,
    PaymentItemService,
    PaymentTermsService,
    TaxesService,
    CurrencyPipe,
    ReportsService,
    PagerService
  ]
})
export class RoleDetailModule { }
