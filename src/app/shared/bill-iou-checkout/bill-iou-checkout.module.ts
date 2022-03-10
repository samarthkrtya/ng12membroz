import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { BillIOUCheckoutComponent } from './bill-iou-checkout.component';
import { DynamicAutocompleteModule } from '../dynamic-autocomplete/dynamic-autocomplete.module';
import { SharedModule } from '../shared.module';
import { CouponService } from '../../core/services/sale/coupon.service';
import { BillPaymentService } from '../../core/services/sale/billpayment.service';
import { AppMaterialModule } from '../../app-material/app-material.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    DynamicAutocompleteModule,
    SharedModule,
  ],
  declarations: [
    BillIOUCheckoutComponent
  ],
  exports: [
    BillIOUCheckoutComponent
  ],
  providers: [
    CurrencyPipe,
    CouponService,
    BillPaymentService,
  ]
})

export class BillIOUCheckoutModule { }
