import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './multiple-payment-routing';
import { MultiplePaymentComponent } from './multiple-payment.component';

import { AppMaterialModule } from '../../../../app-material/app-material.module';
import { CommonService } from '../../../../core/services/common/common.service';
import { DynamicAutocompleteModule  } from '../../../../shared/dynamic-autocomplete/dynamic-autocomplete.module';
import { SharedModule } from '../../../../shared/shared.module'; 

import { MAT_DATE_LOCALE } from '@angular/material/core'; 

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    routing,
    SharedModule,
    DynamicAutocompleteModule,
  ],
  declarations: [
    MultiplePaymentComponent,
    
  ],
  providers: [
    CurrencyPipe,
    CommonService,
    {
      provide: MAT_DATE_LOCALE,
      deps: [CommonService],
      useFactory: ($locale: CommonService) => $locale.currentLocale()
   }
  ],

})
export class MultiplePaymentModule { }
