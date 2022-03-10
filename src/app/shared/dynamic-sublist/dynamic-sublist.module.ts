import { NgModule,CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule,CurrencyPipe,DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DynamicSubListComponent } from './dynamic-sublist.component';
import { MyCurrencyPipe } from '../components/currency.pipe';
import { AppMaterialModule } from '../../app-material/app-material.module';

import { DynamicOperationModule } from '../dynamic-operation/dynamic-operation.module';
import { FormlistService } from '../../core/services/formlist/formlist.service';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    DynamicOperationModule
  ],
  declarations: [
    DynamicSubListComponent
  ],
  exports: [
    DynamicSubListComponent
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
  providers: [   
    FormlistService, 
    DatePipe,
    CurrencyPipe,
    MyCurrencyPipe,
  ]
})
export class DynamicSubListModule { }
