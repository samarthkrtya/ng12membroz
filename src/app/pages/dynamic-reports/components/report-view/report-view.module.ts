import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { routing } from './report-view.routing';
import { ReportViewComponent, SafeHtmlPipe } from './report-view.component';
import { BIReportsService } from '../../../../core/services/reports/bi-report.service';
import { AppMaterialModule } from '../../../../app-material/app-material.module';
import { ReportsService } from '../../../../core/services/reports/reports.service';
import { DynamicOperationModule } from '../../../../shared/dynamic-operation/dynamic-operation.module';
import { ItemSubListComponent } from './item-sub-list/item-sub-list.component';

@NgModule({
  imports: [
    CommonModule,
    routing,
    AppMaterialModule,
    DynamicOperationModule,
  ],
  declarations: [
    ReportViewComponent,
    ItemSubListComponent,
    SafeHtmlPipe
  ],
  exports:[
    ItemSubListComponent
  ],
  providers: [
    BIReportsService,
    ReportsService,
  ]
})
export class ReportViewModule { }