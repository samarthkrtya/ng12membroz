import { NgModule } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FileSaverModule } from 'ngx-filesaver';

import { routing } from './dynamic-list-routing';
import { DynamicListComponent } from './dynamic-list.component';

import { AppMaterialModule } from '../../app-material/app-material.module';
import { DynamictabModule } from '../../shared/dynamictab/dynamictab.module';
import { DynamicOperationModule } from '../../shared/dynamic-operation/dynamic-operation.module';

import { ActivitylogsService  } from '../../core/services/activitylogs/activity-logs.service';
import { FormlistService } from '../../core/services/formlist/formlist.service';

import { SharedModule } from './../../shared/shared.module';
import { MyCurrencyPipe } from './../../shared/components/currency.pipe';


@NgModule({
  
  imports: [
    CommonModule,
    routing,
    AppMaterialModule,
    FormsModule,
    ReactiveFormsModule,
    DynamictabModule,
    FileSaverModule,
    DynamicOperationModule,
    SharedModule
  ],
  declarations: [
    DynamicListComponent,
  ],
  
  providers: [
    DatePipe, 
    ActivitylogsService,
    CurrencyPipe, 
    MyCurrencyPipe,
    FormlistService,
  ]
})
export class DynamicListModule { }
