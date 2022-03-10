import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './loyality-routing';
import { LoyalityComponent } from './loyality.component';

import { AppMaterialModule } from '../../../../app-material/app-material.module';
import { ItemListModule } from '../../../../shared/item-list/item-list.module'
import { FormdataService } from '../../../../core/services/formdata/formdata.service';
import { CashbackService } from '../../../../core/services/payment/cashback.service';
import { TreeChecklistModule } from '../../../../shared/tree-checklist/tree-checklist.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    routing,
    AppMaterialModule,
    ItemListModule,
    TreeChecklistModule,
  ],
  declarations: [
    LoyalityComponent,
  ],
  providers: [
    CashbackService,
    FormdataService
  ]
})
export class LoyalityModule { }
