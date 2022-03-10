import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { WalletTransactionRoutingModule } from './wallet-transaction-routing';
import { WalletTransactionComponent } from './wallet-transaction.component';

import { WalletTransactionDebitComponent } from './components/wallet-transaction-debit/wallet-transaction-debit.component';
import { WalletTransactionDebitMobileComponent } from './components/wallet-transaction-debit-mobile/wallet-transaction-debit-mobile.component';

import { AppMaterialModule } from '../../app-material/app-material.module';

@NgModule({
  
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    WalletTransactionRoutingModule,
    AppMaterialModule
  ],
  declarations: [
    WalletTransactionComponent, 
    WalletTransactionDebitComponent, 
    WalletTransactionDebitMobileComponent
  ],
  exports: [
    WalletTransactionDebitComponent, 
    WalletTransactionDebitMobileComponent
  ]
})
export class WalletTransactionModule {
  static forRoot(): ModuleWithProviders<unknown> {
    return {
      ngModule: WalletTransactionModule,
      providers: [
      ]
    };
  }
 }
