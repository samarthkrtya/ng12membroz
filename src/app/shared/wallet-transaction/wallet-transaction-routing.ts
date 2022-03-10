import { NgModule } from '@angular/core';
import { AppMaterialModule } from '../../app-material/app-material.module';

import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    AppMaterialModule,
    RouterModule.forChild([
    ]),
  ],
})
export class WalletTransactionRoutingModule { }