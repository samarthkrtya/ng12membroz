import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './facility-dailybooking-form-routing';
import { FacilityDailyBookingFormComponent } from './facility-dailybooking-form.component';
import { FacilitybookingService } from './../../../../core/services/service/facilitybooking.service';
import { DynamicAutocompleteModule } from '../../../../shared/dynamic-autocomplete/dynamic-autocomplete.module';
import { GlobalConfirmationModule } from '../../../../shared/global-confirmation/global-confirmation.module';
import { ViewBillBtnModule } from '../../../../shared/buttons/viewbillbtn/viewbillbtn.module';
import { AssetService } from './../../../../core/services/service/asset.service';
import { CommonService } from '../../../../core/services/common/common.service';
import { AppMaterialModule } from '../../../../app-material/app-material.module';
import { MAT_DATE_LOCALE } from '@angular/material/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    routing,
    DynamicAutocompleteModule,
    ViewBillBtnModule,
    GlobalConfirmationModule,
  ],
  declarations: [
    FacilityDailyBookingFormComponent
  ],
  providers: [
    AssetService,
    FacilitybookingService,
    {
      provide: MAT_DATE_LOCALE,
      deps: [CommonService],
      useFactory: ($locale: CommonService) => $locale.currentLocale()
    }
  ]

})
export class FacilityDailyBookingFormModule { }
