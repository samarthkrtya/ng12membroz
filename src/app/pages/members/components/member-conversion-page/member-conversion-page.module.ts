import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { routing } from './member-conversion-page-routing';
import { MemberConversionPageComponent } from './member-conversion-page.component';
import { MemberDetailsModule } from './components/member-details/member-details.module';
import { ProductDetailsComponent } from './components/product-details/product-details.component';
import { MembershipOffersComponent } from './components/membership-offers/membership-offers.component';
import { PaymentDetailsComponent } from './components/payment-details/payment-details.component';
import { AppMaterialModule } from '../../../../app-material/app-material.module';

@NgModule({
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    routing,
    AppMaterialModule,
    MemberDetailsModule,
  ],
  declarations: [
    MemberConversionPageComponent,
    ProductDetailsComponent, 
    MembershipOffersComponent, 
    PaymentDetailsComponent
  ],
  exports:[
    ProductDetailsComponent, 
    MembershipOffersComponent, 
    PaymentDetailsComponent
  ]
})
export class MemberConversionPageModule { }
