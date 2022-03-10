import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './challan-routing';
import { ChallanComponent } from './challan.component';
import { AppMaterialModule } from '../../../../app-material/app-material.module';

import { DynamicAutocompleteModule } from '../../../../shared/dynamic-autocomplete/dynamic-autocomplete.module';
import { ChallanService } from '../../../../core/services/purchase/challan.service';
import { CommonService } from '../../../../core/services/common/common.service';

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
    ChallanComponent
  ],
  providers: [
    CurrencyPipe,
    ChallanService,
    {
      provide: MAT_DATE_LOCALE,
      deps: [CommonService],
      useFactory: ($locale: CommonService) => $locale.currentLocale()
    }
  ]

})
export class ChallanModule { }
