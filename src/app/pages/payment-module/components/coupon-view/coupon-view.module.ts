import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './coupon-view-routing';
import { CouponViewComponent } from './coupon-view.component';
import { AppMaterialModule } from "../../../../app-material/app-material.module";
import { ItemListModule } from '../../../../shared/item-list/item-list.module';
import { SharedModule } from '../../../../shared/shared.module';
import { TreeChecklistModule } from '../../../../shared/tree-checklist/tree-checklist.module';

import { CouponBasicDetailsComponent } from './components/coupon-basic-details/coupon-basic-details.component';
import { ProductListComponent } from './components/product-list/product-list.component';
import { FacilityListComponent } from './components/facility-list/facility-list.component';
import { ServiceListComponent } from './components/services-list/services-list.component';
import { GiftcardListComponent } from './components/giftcard-list/giftcard-list.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    AppMaterialModule,
    ItemListModule,
    SharedModule,
    TreeChecklistModule,
    routing,
  ],
  declarations: [
    CouponViewComponent,
    CouponBasicDetailsComponent,
    ProductListComponent,
    FacilityListComponent,
    GiftcardListComponent,
    ServiceListComponent,
  ],
})
export class CouponViewModule { }
