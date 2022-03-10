import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './customer-usage-routing';
import { CustomerUsageComponent } from './customer-usage.component';

import { AppMaterialModule } from '../../../../app-material/app-material.module';
import { ItemListModule } from '../../../../shared/item-list/item-list.module'
import { SharedModule } from '../../../../shared/shared.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    routing,
    AppMaterialModule,
    ItemListModule,
    SharedModule
  ],
  declarations: [
    CustomerUsageComponent,
  ],
  providers: [
  ]
})

export class CustomerUsageModule { }
