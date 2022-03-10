import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DATE_LOCALE} from '@angular/material/core';

import { routing } from './facility-booking-frontdesk-routing';
import { FacilityBookingFrontdeskComponent } from './facility-booking-frontdesk.component';

import { SharedModule } from '../../../../shared/shared.module';
import { BillItemService } from '../../../../core/services/sale/billitem.service';
import { CommonService } from '../../../../core/services/common/common.service';
import { BillService } from '../../../../core/services/sale/bill.service';
import { AssetService } from '../../../../core/services/service/asset.service';
import { FacilitybookingService } from '../../../../core/services/service/facilitybooking.service';
import { AppMaterialModule } from '../../../../app-material/app-material.module';
import { BillIOUCheckoutModule } from '../../../../shared/bill-iou-checkout/bill-iou-checkout.module';
import { MatOptionSelectAllModule } from '../../../../shared/mat-option-select-all/mat-option-select-all.module';
import { BillCheckOutModule } from '../../../../shared/bill-check-out/bill-check-out.module';
import { DynamicPropertyFieldsModule } from '../../../../shared/dynamic-property-fields/dynamic-property-fields.module';
import { DynamicAutocompleteModule } from '../../../../shared/dynamic-autocomplete/dynamic-autocomplete.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    SharedModule,
    routing,
    BillCheckOutModule,
    BillIOUCheckoutModule,
    MatOptionSelectAllModule,
    DynamicPropertyFieldsModule,
    DynamicAutocompleteModule
  ],
  declarations: [
    FacilityBookingFrontdeskComponent,
  ],
  providers: [
    CurrencyPipe,
    BillItemService,
    AssetService, 
    CommonService,
    BillService,
    FacilitybookingService,
    {
      provide: MAT_DATE_LOCALE,
      deps: [CommonService],
      useFactory: ($locale: CommonService) => $locale.currentLocale()
    }
  ]

})
export class FacilityBookingFrontdeskModule { }