import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './cash-back-routing';
import { CashbackComponent } from './cash-back.component';

import { AppMaterialModule } from '../../../../app-material/app-material.module';
import { ItemListModule } from '../../../../shared/item-list/item-list.module'
import { FormdataService } from '../../../../core/services/formdata/formdata.service';
import { CashbackService } from '../../../../core/services/payment/cashback.service';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    routing,
    AppMaterialModule,
    ItemListModule
  ],
  declarations: [
    CashbackComponent,
  ],
  providers: [
    CashbackService,
    FormdataService
  ]
})
export class CashbackModule { }
