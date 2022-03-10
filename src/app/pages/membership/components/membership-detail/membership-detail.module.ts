import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './membership-detail-routing';
import { MembershipDetailComponent, SanitizeHtmlPipe } from './membership-detail.component';

import { SharedModule } from '../../../../shared/shared.module';
import { AppMaterialModule } from '../../../../app-material/app-material.module';
import { ItemListModule } from '../../../../shared/item-list/item-list.module'
import { MembershipService } from '../../../../core/services/membership/membership.service';
import { PaymentItemService } from '../../../../core/services/payment/paymentitem.service';
import { TaxesService } from '../../../../core/services/payment/taxes.service';
import { PaymentTermsService } from '../../../../core/services/payment/paymentterm.service';
import { TreeChecklistModule } from '../../../../shared/tree-checklist/tree-checklist.module';

import { MembershipBasicDetailsComponent } from './membership-basic-details/membership-basic-details.component';
import { MembershipServiceComponent } from './membership-services/membership-services.component';
import { MembershipProductComponent } from './membership-products/membership-products.component';
import { UsageTermsComponent } from './usage-terms/usage-terms.component'; 
import { MembershipAssetsComponent } from './membership-assets/membership-assets.component';

import {FileUploadModule} from 'ng2-file-upload';
import { Cloudinary } from 'cloudinary-core';
import { CloudinaryModule } from '@cloudinary/angular-5.x';
import { config } from '../../../../config';
const cloudinaryLib = { Cloudinary: Cloudinary};


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    routing,
    AppMaterialModule,
    CloudinaryModule.forRoot(cloudinaryLib, config),
    FileUploadModule,
    ItemListModule,
    TreeChecklistModule,
    SharedModule
  ],
  declarations: [
    MembershipDetailComponent,
    MembershipBasicDetailsComponent,
    MembershipProductComponent,
    MembershipServiceComponent, 
    MembershipAssetsComponent,
    UsageTermsComponent,
    SanitizeHtmlPipe
  ],
  providers: [
    MembershipService,
    PaymentItemService,
    PaymentTermsService,
    TaxesService,
    CurrencyPipe,
  ]
})
export class MembershipModule { }
