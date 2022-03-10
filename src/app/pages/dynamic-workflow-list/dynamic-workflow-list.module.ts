import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './dynamic-workflow-list-routing';
import { DynamicWorkflowListComponent } from './dynamic-workflow-list.component';

import { AppMaterialModule } from '../../app-material/app-material.module';
import { DynamictabModule } from '../../shared/dynamictab/dynamictab.module';
import { DynamicOperationModule } from '../../shared/dynamic-operation/dynamic-operation.module';

import { LookupsService } from '../../core/services/lookups/lookup.service';
import { ActivitylogsService  } from '../../core/services/activitylogs/activity-logs.service';
import { MailalertsService } from '../../core/services/mailalerts/mailalerts.service';
import { BranchesService } from '../../core/services/branches/branch.service';
import { FormlistService } from '../../core/services/formlist/formlist.service';

//import { SafeHtmlPipe } from "../../shared/components/safehtml.pipe";
import { KeysPipe } from './keys.pipe';
import { MyCurrencyPipe } from './../../shared/components/currency.pipe';

import { FileSaverModule } from 'ngx-filesaver';
@NgModule({
  
  imports: [
    CommonModule,
    routing,
    AppMaterialModule,
    FormsModule,
    ReactiveFormsModule,
    DynamictabModule,
    FileSaverModule,
    // MemberHeaderModule,
    DynamicOperationModule
  ],
  declarations: [
    DynamicWorkflowListComponent,
    KeysPipe,
    //SafeHtmlPipe
  ],
  exports: [
    KeysPipe
  ],
  providers: [
    DatePipe,
    LookupsService,
    MailalertsService,
    ActivitylogsService,
    MyCurrencyPipe,
    CurrencyPipe,
    BranchesService,
    FormlistService,
  ]
})
export class DynamicWorkflowListModule { }