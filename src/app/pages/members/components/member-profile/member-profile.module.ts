import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './member-profile-routing';

import { MemberProfileComponent } from './member-profile.component';
import { MemberBasicDetailsComponent } from './components/member-basic-details/member-basic-details.component';
import { AppointmentComponent } from './components/members-activities/components/appointment/appointment.component';
import { PaymenttermsComponent } from './components/paymenttermsaddons/components/paymentterms/paymentterms.component';
import { AddonsComponent } from './components/paymenttermsaddons/components/addons/addons.component';
import { MembershipUsageComponent } from './components/paymenttermsaddons/components/membershipusage/membershipusage.component';
import { MembershipOfferComponent } from './components/paymenttermsaddons/components/membershipoffer/membershipoffer.component';
import { MemberSharedDocumentListComponent } from './components/member-shared-document-list/member-shared-document-list.component';
import { MemberSignedDocumentListComponent } from './components/member-signed-document-list/member-signed-document-list.component';

import { MemberWalletCardIssueComponent } from './components/member-wallet-card-issue/member-wallet-card-issue.component';

import { AppMaterialModule } from '../../../../app-material/app-material.module';
import { ItemListModule } from '../../../../shared/item-list/item-list.module'

import { DynamicAutocompleteModule } from '../../../../shared/dynamic-autocomplete/dynamic-autocomplete.module';
import { DynamicFormdataViewModule } from '../../../../shared/dynamic-formdata-view/dynamic-formdata-view.module';
import { DynamicDispositiondataModule } from '../../../../shared/dynamic-dispositiondata/dynamic-dispositiondata.module';
import { AppointmentBookingModule } from '../../../../shared/appointment-booking/appointment-booking.module';
import { ContactsActivitiesModule } from '../../../../shared/contacts-activities/contacts-activities.module';
import { WeekSchedulesModule } from '../../../../shared/week-schedules/week-schedules.module';
import { ResetPasswordModule } from '../../../../shared/reset-password/reset-password.module';
import { InspectionAssetsModule } from '../../../../shared/inspection-assets/inspection-assets.module'

import { CommonService } from '../../../../core/services/common/common.service';
import { SharedModule } from '../../../../shared/shared.module';

import {FileUploadModule} from 'ng2-file-upload';
import { Cloudinary } from 'cloudinary-core';
import { CloudinaryModule } from '@cloudinary/angular-5.x';
import { config } from '../../../../config';
const cloudinaryLib = { Cloudinary: Cloudinary};

import { KeysPipe } from './keys.pipe';
import { DuePaymentModule } from './components/payments/components/duepayment/duepayment.module';
import { RecieptsModule } from './components/payments/components/reciepts/reciepts.module';
import { AddonsModule } from './components/paymenttermsaddons/components/addons/addons.module';
import { MAT_DATE_LOCALE } from '@angular/material/core'; 
import { BillPaymentsModule } from './components/payments/components/billpayments/billpayments.module';
import { BillsModule } from './components/payments/components/bills/bills.module';
import { MemberLiveHistoryComponent } from './components/member-live-history/member-live-history.component';
import { MemberWalletListModule } from './components/member-wallet-list/member-wallet-list.module';

import { FullCalendarModule } from '@fullcalendar/angular'; // the main connector. must go first
import dayGridPlugin from '@fullcalendar/daygrid'; // a plugin
import interactionPlugin from '@fullcalendar/interaction'; // a plugin
import timeGridPlugin from '@fullcalendar/timegrid';
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid';
import { AppointmentListModule } from 'src/app/shared/appointment-list/appointment-list.module';
import { ClassSchedulesModule } from 'src/app/shared/class-schedules/class-schedules.module';

import { ContractDocumentListModule } from '../../../../shared/contract-document-list/contract-document-list.module';

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
    SharedModule,
    CloudinaryModule.forRoot(cloudinaryLib, config),
    FileUploadModule,
    AppointmentBookingModule,
    ContactsActivitiesModule,
    DynamicFormdataViewModule,
    DuePaymentModule,
    RecieptsModule,
    BillPaymentsModule,
    BillsModule,
    AddonsModule,
    DynamicDispositiondataModule,
    WeekSchedulesModule,
    ResetPasswordModule,
    InspectionAssetsModule,
    MemberWalletListModule,
    FullCalendarModule,
    AppointmentListModule,
    ClassSchedulesModule,
    ContractDocumentListModule
  ],
  declarations: [
    MemberProfileComponent,
    MemberBasicDetailsComponent,
    AppointmentComponent,
    PaymenttermsComponent,
    MemberBasicDetailsComponent,
    KeysPipe, 
    MemberWalletCardIssueComponent,
    MembershipUsageComponent, 
    MembershipOfferComponent, 
    MemberSharedDocumentListComponent,
    MemberSignedDocumentListComponent,
    MemberLiveHistoryComponent,
  ],
  exports: [
    MemberBasicDetailsComponent,
    AppointmentComponent,
    PaymenttermsComponent,
    MemberWalletCardIssueComponent,
    MemberSharedDocumentListComponent, 
    MemberSignedDocumentListComponent,
    KeysPipe,
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
export class MemberProfileModule { }
