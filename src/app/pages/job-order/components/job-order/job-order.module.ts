import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './job-order-routing';
import { JobOrderComponent } from './job-order.component';

import { SharedModule } from '../../../../shared/shared.module';
import { BillItemService } from '../../../../core/services/sale/billitem.service';
import { CommonService } from '../../../../core/services/common/common.service';
import { BillService } from '../../../../core/services/sale/bill.service';
import { BillPaymentService } from '../../../../core/services/sale/billpayment.service';
import { ServiceService } from '../../../../core/services/service/service.service';
import { AppMaterialModule } from '../../../../app-material/app-material.module';
import { BillCheckoutModule } from '../../../../shared/bill-checkout/bill-checkout.module';
import { BillIOUCheckoutModule } from '../../../../shared/bill-iou-checkout/bill-iou-checkout.module';
import { MatOptionSelectAllModule } from '../../../../shared/mat-option-select-all/mat-option-select-all.module';

import { MAT_DATE_LOCALE } from '@angular/material/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    SharedModule,
    routing,
    BillCheckoutModule,
    BillIOUCheckoutModule,
    MatOptionSelectAllModule,
  ],
  declarations: [
    JobOrderComponent,
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