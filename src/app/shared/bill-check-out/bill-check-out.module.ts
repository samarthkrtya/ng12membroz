import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { BillCheckOutComponent } from './bill-check-out.component';
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
    BillCheckOutComponent
  ],
  exports: [
    BillCheckOutComponent
  ],
  providers: [
    CurrencyPipe,
    CouponService,
    BillPaymentService,
  ]
})

export class BillCheckOutModule { }
