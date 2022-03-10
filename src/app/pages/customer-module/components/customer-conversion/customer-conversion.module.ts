import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './customer-conversion-routing';

import { CustomerConversionComponent } from './customer-conversion.component';
import { ConversionBasicDetailsComponent } from './components/conversion-basic-details/conversion-basic-details.component'
import { ConversionOtherDetailsComponent } from './components/conversion-other-details/conversion-other-details.component';
import { ConversionProductDetailsComponent } from './components/conversion-product-details/conversion-product-details.component';
import { ConversionPaymentDetailsComponent } from './components/conversion-payment-details/conversion-payment-details.component';

import { AppMaterialModule } from '../../../../app-material/app-material.module';
import { ItemListModule } from '../../../../shared/item-list/item-list.module';


import { SharedModule } from '../../../../shared/shared.module';
import { DynamicAutocompleteModule } from '../../../../shared/dynamic-autocomplete/dynamic-autocomplete.module';
import { ContactsActivitiesModule } from '../../../../shared/contacts-activities/contacts-activities.module';

import {FileUploadModule} from 'ng2-file-upload';
import { Cloudinary } from 'cloudinary-core';
import { CloudinaryModule } from '@cloudinary/angular-5.x';
import { config } from '../../../../config';

const cloudinaryLib = { Cloudinary: Cloudinary};

@NgModule({
  imports: [
    CommonModule,
    routing,
    AppMaterialModule,
    ItemListModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    DynamicAutocompleteModule,
    CloudinaryModule.forRoot(cloudinaryLib, config),
    ContactsActivitiesModule,
    FileUploadModule,
  ],
  declarations: [
    CustomerConversionComponent,
    ConversionBasicDetailsComponent,
    ConversionOtherDetailsComponent,
    ConversionProductDetailsComponent,
    ConversionPaymentDetailsComponent,
  ],
  exports: [
    ConversionBasicDetailsComponent,
    ConversionOtherDetailsComponent,
    ConversionProductDetailsComponent,
    ConversionPaymentDetailsComponent,
  ],
  providers: [
    CurrencyPipe
  ]
})
export class CustomerConversionModule { }
