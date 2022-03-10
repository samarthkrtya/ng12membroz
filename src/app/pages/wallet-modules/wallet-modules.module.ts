import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { WalletModulesRoutes } from './wallet-modules-routing';
import { WalletModulesComponent } from './wallet-modules.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(WalletModulesRoutes),
  ],
  declarations: [
    WalletModulesComponent
  ],
})
export class WalletModulesModule { }