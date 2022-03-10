import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WalletModulesComponent } from './wallet-modules.component';

export const WalletModulesRoutes: Routes = [
  {
    path: '', component: WalletModulesComponent,
    children: [
      {
        path: 'debit',
        loadChildren: () => import('./components/wallet-debit/wallet-debit.module').then(m => m.WalletDebitModule),
      },
      {
        path: 'payment',
        loadChildren: () => import('./components/wallet-payment/wallet-payment.module').then(m => m.WalletPaymentModule),
      }
    ],
  },
];