import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { routing } from './reports-list.routing';
import { ReportsListComponent } from './reports-list.component';
import { BIReportsService } from '../../../../core/services/reports/bi-report.service';
import { ReportsService } from '../../../../core/services/reports/reports.service';
import { AppMaterialModule } from '../../../../app-material/app-material.module';

@NgModule({
  imports: [
    CommonModule,
    routing,
    AppMaterialModule,
  ],
  declarations: [
    ReportsListComponent
  ],
  providers: [
    BIReportsService,
    ReportsService
  ]
})
export class ReportsListModule { }