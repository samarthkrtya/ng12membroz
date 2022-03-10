import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { FileUploadModule } from 'ng2-file-upload';
import { Cloudinary } from 'cloudinary-core';
import { CloudinaryModule } from '@cloudinary/angular-5.x';
import { config } from '../../../../config';
const cloudinaryLib = { Cloudinary: Cloudinary };
import { MAT_DATE_LOCALE } from '@angular/material/core'; 

import { routing } from './purchase-invoice-routing';
import { PurchaseInvoiceComponent } from './purchase-invoice.component';
import { AppMaterialModule } from '../../../../app-material/app-material.module';
import { DynamicAutocompleteModule } from '../../../../shared/dynamic-autocomplete/dynamic-autocomplete.module';
import { InventoryTableModule } from '../../../../shared/inventory-table/inventory-table.module';
import { DynamicPropertyFieldsModule } from '../../../../shared/dynamic-property-fields/dynamic-property-fields.module';
import { QuickaddModule } from '../../../../shared/quickadd/quickadd.module';
import { CommonService } from '../../../../core/services/common/common.service';
import { SharedModule } from '../../../../shared/shared.module';


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
    DynamicPropertyFieldsModule,
    QuickaddModule,
    SharedModule,
  ],
  declarations: [
    PurchaseInvoiceComponent
  ],
  providers: [
    CurrencyPipe,
    {
      provide: MAT_DATE_LOCALE,
      deps: [CommonService],
      useFactory: ($locale: CommonService) => $locale.currentLocale()
    }
  ]

})
export class PurchaseInvoiceModule { }
