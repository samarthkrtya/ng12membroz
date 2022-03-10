import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';

import { routing } from './dynamic-dashboard.routing';
import { DynamicDashboardComponent } from './dynamic-dashboard.component';
import { DashboardRowComponent } from './components/dashboard-row/dashboard-row.component';
import { AdminDashboardService } from './../../core/services/admin/adminDashboard.service';
import { CommonService } from '../../core/services/common/common.service';
import { MyCurrencyPipe } from '../../shared/components/currency.pipe';
import { WfPermissionModule } from '../../shared/wf-permission/wf-permission.module';
import { AppMaterialModule } from './../../app-material/app-material.module';
import { SharedModule } from '../../shared/shared.module';
import { YearFormat , MonthFormat } from './dateformat.directive';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    routing,
    AppMaterialModule,
    WfPermissionModule,
    SharedModule,
  ],
  declarations: [
    DynamicDashboardComponent,
    DashboardRowComponent,
    YearFormat,
    MonthFormat
  ],
  providers:[ 
    AdminDashboardService,
    CommonService,
    DatePipe,
    MyCurrencyPipe,
    CurrencyPipe, 
    //{
      //provide: DateAdapter, useClass: AppDateAdapter
    //},
  ], 
})
export class DynamicDashboardModule {}
