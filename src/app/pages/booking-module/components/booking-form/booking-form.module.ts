import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './booking-form-routing';
import { BookingFormComponent } from './booking-form.component';
import { AppMaterialModule } from '../../../../app-material/app-material.module';
import { BookingService } from '../../../../core/services/service/booking.service';
import { ResortService } from '../../../../core/services/resort/resort.service';
import { DynamicAutocompleteModule } from '../../../../shared/dynamic-autocomplete/dynamic-autocomplete.module';
import { TaxesService } from '../../../../core/services/payment/taxes.service';
import { CommonService } from '../../../../core/services/common/common.service';

import { MAT_DATE_LOCALE } from '@angular/material/core';
import { DynamicPropertyFieldsModule } from '../../../../shared/dynamic-property-fields/dynamic-property-fields.module';
import { GlobalConfirmationModule } from '../../../../shared/global-confirmation/global-confirmation.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    routing,
    DynamicAutocompleteModule,
    DynamicPropertyFieldsModule,
    GlobalConfirmationModule
  ],
  declarations: [
    BookingFormComponent
  ],
  providers: [
    ResortService,
    BookingService,
    TaxesService,
    {
      provide: MAT_DATE_LOCALE,
      deps: [CommonService],
      useFactory: ($locale: CommonService) => $locale.currentLocale()
   },   
  ],

})
export class BookingFormModule { }
