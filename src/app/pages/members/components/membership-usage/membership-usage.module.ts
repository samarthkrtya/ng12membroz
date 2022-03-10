import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './membership-usage-routing';
import { MembershipUsageComponent } from './membership-usage.component';

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
    MembershipUsageComponent,
  ],
  providers: [
  ]
})

export class MembershipUsageModule { }
