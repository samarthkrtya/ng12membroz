import { Component, NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './wallet-payment-routing';

import { WalletPaymentComponent } from './wallet-payment.component';

import { AppMaterialModule } from '../../../../app-material/app-material.module'
import { BillService } from 'src/app/core/services/sale/bill.service';
import { BillPaymentService } from 'src/app/core/services/sale/billpayment.service';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    routing,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    SharedModule,
  ],
  declarations: [WalletPaymentComponent],
  providers : [
    CurrencyPipe,
    BillService,
    BillPaymentService,
  ]
})
export class WalletPaymentModule {}
