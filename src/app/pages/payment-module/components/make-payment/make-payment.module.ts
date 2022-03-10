import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './make-payment-routing';
import { MakePaymentComponent } from './make-payment.component';

import { AppMaterialModule } from '../../../../app-material/app-material.module';
import { CommonService } from '../../../../core/services/common/common.service';
import { DynamicAutocompleteModule  } from '../../../../shared/dynamic-autocomplete/dynamic-autocomplete.module';

import { MAT_DATE_LOCALE } from '@angular/material/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    routing,
    DynamicAutocompleteModule
  ],
  declarations: [
    MakePaymentComponent
  ],
  providers: [
    CommonService,
    {
      provide: MAT_DATE_LOCALE,
      deps: [CommonService],
      useFactory: ($locale: CommonService) => $locale.currentLocale()
    }
  ]

})
export class MakePaymentModule { }
