import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { FileUploadModule } from 'ng2-file-upload';
import { Cloudinary } from 'cloudinary-core';
import { CloudinaryModule } from '@cloudinary/angular-5.x';
import { config } from '../../../../config';
const cloudinaryLib = { Cloudinary: Cloudinary };

import { routing } from './expense-routing';
import { ExpenseComponent } from './expense.component';
import { AppMaterialModule } from '../../../../app-material/app-material.module';
import { DynamicAutocompleteModule } from '../../../../shared/dynamic-autocomplete/dynamic-autocomplete.module';
import { ExpenseService } from '../../../../core/services/purchase/expense.service';
import { FinanceService } from '../../../../core/services/finance/finance.service';
import { CommonService } from '../../../../core/services/common/common.service';

import { MAT_DATE_LOCALE } from '@angular/material/core'; 

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    routing,
    CloudinaryModule.forRoot(cloudinaryLib, config),
    FileUploadModule,
    DynamicAutocompleteModule,
  ],
  declarations: [
    ExpenseComponent

  ],
  providers: [
    CurrencyPipe,
    ExpenseService,
    FinanceService,
    {
      provide: MAT_DATE_LOCALE,
      deps: [CommonService],
      useFactory: ($locale: CommonService) => $locale.currentLocale()
    }
  ]

})
export class ExpenseModule { }
