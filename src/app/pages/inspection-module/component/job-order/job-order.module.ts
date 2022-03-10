import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './job-order-routing';
import { JobOrderComponent } from './job-order.component';
import { AppMaterialModule } from '../../../../app-material/app-material.module';

import { SharedModule } from '../../../../shared/shared.module';
import { InspectionAssetsModule } from '../../../../shared/inspection-assets/inspection-assets.module';
import { BillItemService } from '../../../../core/services/sale/billitem.service';
import { CommonService } from '../../../../core/services/common/common.service';
import { BillService } from '../../../../core/services/sale/bill.service';
import { BillPaymentService } from '../../../../core/services/sale/billpayment.service';
import { ServiceService } from '../../../../core/services/service/service.service';
import { BillCheckOutModule } from '../../../../shared/bill-check-out/bill-check-out.module';
import { BillIOUCheckoutModule } from '../../../../shared/bill-iou-checkout/bill-iou-checkout.module';
import { MatOptionSelectAllModule } from '../../../../shared/mat-option-select-all/mat-option-select-all.module';
import { DynamicPropertyFieldsModule } from '../../../../shared/dynamic-property-fields/dynamic-property-fields.module';

import { MAT_DATE_LOCALE } from '@angular/material/core';

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
    InspectionAssetsModule,
    DynamicPropertyFieldsModule
  ],
  declarations: [
    JobOrderComponent
  ],
  providers: [
    CurrencyPipe,
    BillItemService,
    ServiceService,
    CommonService,
    BillService,
    BillPaymentService,
    {
      provide: MAT_DATE_LOCALE,
      deps: [CommonService],
      useFactory: ($locale: CommonService) => $locale.currentLocale()
    }
  ]

})
export class JobOrderModule { }