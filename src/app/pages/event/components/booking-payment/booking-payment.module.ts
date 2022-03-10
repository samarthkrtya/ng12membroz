import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './booking-payment-routing';
import { BookingPaymentComponent } from './booking-payment.component';

import { AppMaterialModule } from '../../../../app-material/app-material.module';
import { SharedModule } from '../../../../shared/shared.module';
import { BillCheckoutModule } from '../../../../shared/bill-checkout/bill-checkout.module';
import { BillPaymentService } from '../../../../core/services/sale/billpayment.service';
import { BillService } from '../../../../core/services/sale/bill.service';
import { BillCheckOutModule } from '../../../../shared/bill-check-out/bill-check-out.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    routing,
    SharedModule,
    BillCheckoutModule,
    BillCheckOutModule,
  ],
  declarations: [
    BookingPaymentComponent
  ],
  providers: [
    CurrencyPipe, 
    BillPaymentService,
    BillService,
  ]

})
export class BookingPaymentModule { }
