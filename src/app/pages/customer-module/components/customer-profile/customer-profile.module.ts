import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './customer-profile-routing';

import { CustomerProfileComponent } from './customer-profile.component';
import { CustomerBasicDetailsComponent } from './components/customer-basic-details/customer-basic-details.component';

import { AppMaterialModule } from '../../../../app-material/app-material.module';
import { ItemListModule } from '../../../../shared/item-list/item-list.module'

import { DynamicAutocompleteModule } from '../../../../shared/dynamic-autocomplete/dynamic-autocomplete.module';
import { AppointmentBookingModule } from '../../../../shared/appointment-booking/appointment-booking.module';
import { DynamicDispositionformModule } from '../../../../shared/dynamic-dispositionform/dynamic-dispositionform.module';
import { DynamicDispositiondataModule } from '../../../../shared/dynamic-dispositiondata/dynamic-dispositiondata.module';
import { SharedModule } from '../../../../shared/shared.module';
import { ContactsActivitiesModule } from '../../../../shared/contacts-activities/contacts-activities.module';
import { InspectionAssetsModule } from '../../../../shared/inspection-assets/inspection-assets.module'
import { MAT_DATE_LOCALE } from '@angular/material/core'; 
import { AddonsModule } from '../../../members/components/member-profile/components/paymenttermsaddons/components/addons/addons.module';
import { BillRecieptsModule } from './components/payments/billreciepts/billreciepts.module';
import { DuePaymentBillModule } from './components/payments/duepaymentbill/duepaymentbill.module';

import { FileUploadModule } from 'ng2-file-upload';
import { Cloudinary } from 'cloudinary-core';
import { CloudinaryModule } from '@cloudinary/angular-5.x';
import { config } from '../../../../config';
import { MemberWalletListModule } from '../../../members/components/member-profile/components/member-wallet-list/member-wallet-list.module';

import { CommonService } from 'src/app/core/services/common/common.service';
import { CustomerSharedDocumentListComponent } from './components/customer-shared-document-list/customer-shared-document-list.component';
import { CustomerFacilityBookingComponent } from './components/customer-facilitybooking/customer-facilitybooking.component';
import { CustomerBookingComponent } from './components/customer-booking/customer-booking.component';
import { CustomerAssetComponent } from './components/customer-asset/customer-asset.component';
import { CustomerBookingCalendarComponent } from './components/customer-booking-calendar/customer-booking-calendar.component';

const cloudinaryLib = { Cloudinary: Cloudinary};

import { FullCalendarModule } from '@fullcalendar/angular'; // the main connector. must go first
import dayGridPlugin from '@fullcalendar/daygrid'; // a plugin
import interactionPlugin from '@fullcalendar/interaction'; // a plugin
import timeGridPlugin from '@fullcalendar/timegrid';
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid';
import { CustomerRefererComponent } from './components/customer-referer/customer-referer.component';
import { CustomerReferralComponent } from './components/customer-referral/customer-referral.component';
import { ContactsAappointment } from './components/contacts-appointment/contacts-appointment.component';
import { AppointmentListModule } from 'src/app/shared/appointment-list/appointment-list.module';
import { ClassSchedulesModule } from 'src/app/shared/class-schedules/class-schedules.module';

FullCalendarModule.registerPlugins([ // register FullCalendar plugins
  dayGridPlugin,
  interactionPlugin,
  timeGridPlugin,
  resourceTimeGridPlugin
]);

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
    BillRecieptsModule,
    DuePaymentBillModule,
    DynamicDispositiondataModule,
    InspectionAssetsModule,
    CloudinaryModule.forRoot(cloudinaryLib, config),
    FileUploadModule,
    MemberWalletListModule,
    FullCalendarModule,
    AppointmentBookingModule,
    AppointmentListModule,
    ClassSchedulesModule
  ],
  declarations: [
    CustomerProfileComponent,
    CustomerBasicDetailsComponent,
    CustomerRefererComponent,
    CustomerAssetComponent,
    CustomerSharedDocumentListComponent,
    CustomerFacilityBookingComponent,
    CustomerBookingComponent,
    CustomerBookingCalendarComponent,
    CustomerReferralComponent,
    ContactsAappointment,
  ],
  exports: [
    CustomerBasicDetailsComponent,
    CustomerBookingCalendarComponent,
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
export class CustomerProfileModule { }
