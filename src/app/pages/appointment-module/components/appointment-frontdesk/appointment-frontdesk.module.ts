import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DATE_LOCALE} from '@angular/material/core';

import { routing } from './appointment-frontdesk-routing';
import { AppointmentFrontdeskComponent } from './appointment-frontdesk.component';

import { SharedModule } from '../../../../shared/shared.module';
import { BillItemService } from '../../../../core/services/sale/billitem.service';
import { CommonService } from '../../../../core/services/common/common.service';
import { BillService } from '../../../../core/services/sale/bill.service';
import { ServiceService } from '../../../../core/services/service/service.service';
import { AppointmentService } from '../../../../core/services/service/appointment.service';
import { BillCheckOutModule } from '../../../../shared/bill-check-out/bill-check-out.module';
import { DynamicPropertyFieldsModule } from '../../../../shared/dynamic-property-fields/dynamic-property-fields.module';
import { AppMaterialModule } from '../../../../app-material/app-material.module';
import { BillIOUCheckoutModule } from '../../../../shared/bill-iou-checkout/bill-iou-checkout.module';
import { MatOptionSelectAllModule } from '../../../../shared/mat-option-select-all/mat-option-select-all.module';
import { DynamicAutocompleteModule } from '../../../../shared/dynamic-autocomplete/dynamic-autocomplete.module';
import { AppointmentBookingModule } from '../../../../shared/appointment-booking/appointment-booking.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule, 
    SharedModule,
    routing,
    BillCheckOutModule,
    BillIOUCheckoutModule,
    MatOptionSelectAllModule,
    DynamicPropertyFieldsModule,
    DynamicAutocompleteModule,
    AppointmentBookingModule,
  ],
  declarations: [
    AppointmentFrontdeskComponent,
  ],
  providers: [
    CurrencyPipe,
    BillItemService,
    ServiceService,
    CommonService,
    BillService,
    AppointmentService,
    {
      provide: MAT_DATE_LOCALE,
      deps: [CommonService],
      useFactory: ($locale: CommonService) => $locale.currentLocale()
    }
  ]

})
export class AppointmentFrontdeskModule { }