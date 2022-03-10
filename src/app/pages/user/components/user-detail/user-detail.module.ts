import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './user-detail-routing';
import { UserDetailComponent } from './user-detail.component';

import { AppMaterialModule } from '../../../../app-material/app-material.module';
import { ItemListModule } from '../../../../shared/item-list/item-list.module'
import { SharedModule } from '../../../../shared/shared.module';
import { TreeChecklistModule } from '../../../../shared/tree-checklist/tree-checklist.module';
import { AvailabilityCalendarModule } from '../../../../shared/availability-calendar/availability-calendar.module';

import {MatSlideToggleModule} from '@angular/material/slide-toggle';

import { FullCalendarModule } from '@fullcalendar/angular'; // the main connector. must go first
import dayGridPlugin from '@fullcalendar/daygrid'; // a plugin
import interactionPlugin from '@fullcalendar/interaction'; // a plugin
import timeGridPlugin from '@fullcalendar/timegrid';
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid';


import { PaymentItemService } from '../../../../core/services/payment/paymentitem.service';
import { TaxesService } from '../../../../core/services/payment/taxes.service';
import { PaymentTermsService } from '../../../../core/services/payment/paymentterm.service';
import { UsersService } from 'src/app/core/services/users/users.service';



import { UserBasicDetailsComponent } from './user-basic-details/user-basic-details.component';
import { UserAvailabiltyComponent } from './user-availability/user-availability.component';
import { UserPricesComponent } from './user-prices/user-prices.component';

import { UserLeaveComponent } from './user-leave/user-leave.component';
import { UserAttendanceComponent } from './user-attendance/user-attendance.component';
import { UserTimesheetComponent } from './user-timesheet/user-timesheet.component';
import { UserSharedDocumentListComponent } from './user-shared-document-list/user-shared-document-list.component';
import { UserCompanyListComponent } from './user-company-list/user-company-list.component';
import { UserSalaryComponent } from './user-salary/user-salary.component';
import { SignedDocumentComponent } from './signed-document/signed-document.component';
import { AcknowledgeDocumentComponent } from './acknowledge-document/acknowledge-document.component';
import { LeaveRequestComponent } from './leave-request/leave-request.component';
import { EarningComponent } from './earning/earning.component';
import { SettlementComponent } from './settlement/settlement.component';

import {FileUploadModule} from 'ng2-file-upload';
import { Cloudinary } from 'cloudinary-core';
import { CloudinaryModule } from '@cloudinary/angular-5.x';
import { config } from '../../../../config';
const cloudinaryLib = { Cloudinary: Cloudinary};

import { MAT_DATE_LOCALE } from '@angular/material/core';
import { CommonService } from '../../../../core/services/common/common.service';
import { UserWalletListComponent } from './user-wallet-list/user-wallet-list.component';

import { UserWalletCardIssueComponent } from './user-wallet-card-issue/user-wallet-card-issue.component';
import { UserEarningsComponent } from './user-earnings/user-earnings.component';


import { ContactsActivitiesModule } from '../../../../shared/contacts-activities/contacts-activities.module';
import { ResetPasswordModule } from '../../../../shared/reset-password/reset-password.module';
import { UserAttendanceCalendarComponent } from './user-attendance-calendar/user-attendance-calendar.component';

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
    FormsModule,
    ReactiveFormsModule,
    routing,
    AppMaterialModule,
    CloudinaryModule.forRoot(cloudinaryLib, config),
    FileUploadModule,
    ItemListModule,
    TreeChecklistModule,
    SharedModule,
    MatSlideToggleModule,
    FullCalendarModule,
    AvailabilityCalendarModule,
    ContactsActivitiesModule,
    ResetPasswordModule,
    ContractDocumentListModule
  ],
  declarations: [
    UserDetailComponent,
    UserBasicDetailsComponent,
    UserAvailabiltyComponent,
    UserPricesComponent,
    UserLeaveComponent,
    UserAttendanceComponent,
    UserTimesheetComponent,
    UserSharedDocumentListComponent,
    UserCompanyListComponent,
    UserSalaryComponent,
    SignedDocumentComponent,
    AcknowledgeDocumentComponent,
    LeaveRequestComponent,
    EarningComponent,
    SettlementComponent,
    UserWalletListComponent,
    UserWalletCardIssueComponent,
    UserEarningsComponent,
    UserAttendanceCalendarComponent
  ],
  exports: [
  ],
  providers: [ 
    UsersService,
    PaymentItemService,
    PaymentTermsService,
    TaxesService,
    CurrencyPipe,
    {
      provide: MAT_DATE_LOCALE,
      deps: [CommonService],
      useFactory: ($locale: CommonService) => $locale.currentLocale()
  }
  ]
})
export class UserDetailModule { }
