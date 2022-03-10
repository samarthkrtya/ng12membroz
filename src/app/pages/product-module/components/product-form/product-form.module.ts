import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AngularEditorModule } from '@kolkov/angular-editor';
import { FileUploadModule } from 'ng2-file-upload';
import { Cloudinary } from 'cloudinary-core';
import { CloudinaryModule } from '@cloudinary/angular-5.x';
import { config } from '../../../../config';
const cloudinaryLib = { Cloudinary: Cloudinary };
import { AppMaterialModule } from '../../../../app-material/app-material.module';
import { QuickaddModule } from '../../../../shared/quickadd/quickadd.module';

import { routing } from './product-form-routing';
import { ProductFormComponent } from './product-form.component';
import { LookupsService } from '../../../../core/services/lookups/lookup.service';
import { TaxesService } from '../../../../core/services/payment/taxes.service';
import { FormdataService } from '../../../../core/services/formdata/formdata.service';
import { BillItemService } from '../../../../core/services/sale/billitem.service';
import { DynamicAutocompleteModule } from '../../../../shared/dynamic-autocomplete/dynamic-autocomplete.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    routing,
    AngularEditorModule,
    CloudinaryModule.forRoot(cloudinaryLib, config),
    FileUploadModule,
    DynamicAutocompleteModule,
    QuickaddModule,
  ],
  declarations: [
    ProductFormComponent
  ],
  providers: [
    LookupsService,
    TaxesService,
    FormdataService,
    BillItemService
  ]

})
export class ProductFormModule { }
