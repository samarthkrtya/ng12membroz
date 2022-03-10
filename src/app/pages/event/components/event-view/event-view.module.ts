import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DATE_LOCALE } from '@angular/material/core';

import { routing } from './event-view-routing';
import { EventViewComponent } from './event-view.component';
import { EventDetailComponent } from './event-detail/event-detail.component';
import { TicketsComponent } from './tickets/tickets.component';

import { SchedulerComponent } from './scheduler/scheduler.component';
import { EnrollmentComponent } from './enrollment/enrollment.component';

import { AttendeeComponent } from './attendee/attendee.component';
import { AppointmentBookingComponent } from './appointment-booking/appointment-booking.component';

import { InviteesComponent } from './invitees/invitees.component';
import { BillPaymentsModule } from '../../../members/components/member-profile/components/payments/components/billpayments/billpayments.module';
import { BillsModule } from '../../../members/components/member-profile/components/payments/components/bills/bills.module';
import { DynamicAutocompleteModule } from '../../../../shared/dynamic-autocomplete/dynamic-autocomplete.module';
import { DynamicSubListModule } from '../../../../shared/dynamic-sublist/dynamic-sublist.module';
import { AppMaterialModule } from '../../../../app-material/app-material.module';
import { CommonService } from '../../../../core/services/common/common.service';
import { ItemListModule } from '../../../../shared/item-list/item-list.module';
import { SharedModule } from '../../../../shared/shared.module';

import { FullCalendarModule } from '@fullcalendar/angular'; // the main connector. must go first
import dayGridPlugin from '@fullcalendar/daygrid'; // a plugin
import interactionPlugin from '@fullcalendar/interaction'; // a plugin
import timeGridPlugin from '@fullcalendar/timegrid';
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid';


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
    FullCalendarModule,
    AppMaterialModule,  
    routing,
    ItemListModule,
    SharedModule,
    DynamicSubListModule,
    DynamicAutocompleteModule,
    BillPaymentsModule,
    BillsModule,
  ],
  declarations: [
    EventViewComponent,
    EventDetailComponent,
    TicketsComponent,
    InviteesComponent,
    AttendeeComponent,
    EnrollmentComponent,
    AppointmentBookingComponent,
    SchedulerComponent,
  ],
  providers: [
     {
      provide: MAT_DATE_LOCALE,
      deps: [CommonService],
       useFactory: ($locale: CommonService) => $locale.currentLocale()
     }
  ]
})
export class EventViewModule { }
