import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './vendor-profile-routing';

import { VendorProfileComponent } from './vendor-profile.component';
import { AppMaterialModule } from '../../../../app-material/app-material.module';
import { ItemListModule } from '../../../../shared/item-list/item-list.module'

import { DynamicAutocompleteModule } from '../../../../shared/dynamic-autocomplete/dynamic-autocomplete.module';
import { DynamicDispositionformModule } from '../../../../shared/dynamic-dispositionform/dynamic-dispositionform.module';
import { DynamicDispositiondataModule } from '../../../../shared/dynamic-dispositiondata/dynamic-dispositiondata.module';
import { SharedModule } from '../../../../shared/shared.module';
import { ContactsActivitiesModule } from '../../../../shared/contacts-activities/contacts-activities.module';
import { InspectionAssetsModule } from '../../../../shared/inspection-assets/inspection-assets.module'
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { AddonsModule } from '../../../members/components/member-profile/components/paymenttermsaddons/components/addons/addons.module';
import { FileUploadModule } from 'ng2-file-upload';
import { Cloudinary } from 'cloudinary-core';
import { CloudinaryModule } from '@cloudinary/angular-5.x';
import { config } from '../../../../config';
import { MemberWalletListModule } from '../../../members/components/member-profile/components/member-wallet-list/member-wallet-list.module';
import { CommonService } from 'src/app/core/services/common/common.service';
import { VendorPaymentComponent } from './components/vendor-payment/vendor-payment.component';
import { VendorPurchageInvoiceComponent } from './components/vendor-purchage-invoice/vendor-purchage-invoice.component';
import { VendorPurchageOrderComponent } from './components/vendor-purchage-order/vendor-purchage-order.component';
import { VendorBasicDetailsComponent } from './components/vendor-basic-details/vendor-basic-details.component';

const cloudinaryLib = { Cloudinary: Cloudinary };

@NgModule({
  imports: [
    CommonModule,
    routing,
    AppMaterialModule,
    ItemListModule,
    FormsModule,
    ReactiveFormsModule,
    DynamicAutocompleteModule,
    DynamicDispositionformModule,
    SharedModule,
    ContactsActivitiesModule,
    AddonsModule,
    DynamicDispositiondataModule,
    InspectionAssetsModule,
    CloudinaryModule.forRoot(cloudinaryLib, config),
    FileUploadModule,
    MemberWalletListModule
  ],
  declarations: [
    VendorProfileComponent,
    VendorPaymentComponent,
    VendorPurchageInvoiceComponent,
    VendorPurchageOrderComponent,
    VendorBasicDetailsComponent
  ],
  exports: [
    VendorBasicDetailsComponent
  ],
  providers: [
    CommonService,
    CurrencyPipe,
    {
      provide: MAT_DATE_LOCALE,
      deps: [CommonService],
      useFactory: ($locale: CommonService) => $locale.currentLocale()
    }
  ]
})
export class VendorProfileModule { }
