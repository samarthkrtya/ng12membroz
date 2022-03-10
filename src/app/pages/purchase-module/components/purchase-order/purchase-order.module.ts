import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



import { routing } from './purchase-order-routing';
import { PurchaseOrderComponent } from './purchase-order.component';
import { AppMaterialModule } from '../../../../app-material/app-material.module';

import { FileUploadModule } from 'ng2-file-upload';
import { Cloudinary } from 'cloudinary-core';
import { CloudinaryModule } from '@cloudinary/angular-5.x';
import { config } from '../../../../config';
const cloudinaryLib = { Cloudinary: Cloudinary };

import { DynamicAutocompleteModule } from '../../../../shared/dynamic-autocomplete/dynamic-autocomplete.module';
import { InventoryTableModule } from '../../../../shared/inventory-table/inventory-table.module';
import { PurchaseOrderService } from '../../../../core/services/purchase/purchaseorder.service';
import { CommonService } from '../../../../core/services/common/common.service';

import { MAT_DATE_LOCALE } from '@angular/material/core'; 

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    routing,
    CloudinaryModule.forRoot(cloudinaryLib, config),
    FileUploadModule,
    DynamicAutocompleteModule,
    InventoryTableModule,
  ],
  declarations: [
    PurchaseOrderComponent

  ],
  providers: [
    CurrencyPipe,
    PurchaseOrderService,
    {
      provide: MAT_DATE_LOCALE,
      deps: [CommonService],
      useFactory: ($locale: CommonService) => $locale.currentLocale()
    }
  ]

})
export class PurchaseOrderModule { }
