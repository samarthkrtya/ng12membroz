import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './wallet-debit-routing';

import { WalletDebitComponent } from './wallet-debit.component';

import { WalletTransactionModule } from '../../../../shared/wallet-transaction/wallet-transaction.module';

import { AppMaterialModule } from '../../../../app-material/app-material.module'

@NgModule({
  imports: [
    CommonModule,
    routing,
    FormsModule,
    ReactiveFormsModule,
    WalletTransactionModule,
    AppMaterialModule
  ],
  declarations: [
    WalletDebitComponent
  ]
})
export class WalletDebitModule { }
