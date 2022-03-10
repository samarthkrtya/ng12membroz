import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DATE_LOCALE} from '@angular/material/core';

import { routing } from './appointment-booking-form-routing';
import { AppointmentBookingFormComponent } from './appointment-booking-form.component';
import { AppMaterialModule } from '../../../../app-material/app-material.module';

import { DynamicAutocompleteModule } from '../../../../shared/dynamic-autocomplete/dynamic-autocomplete.module';
import { GlobalConfirmationModule } from '../../../../shared/global-confirmation/global-confirmation.module';

import { ServiceService } from '../../../../core/services/service/service.service';
import { AppointmentService } from '../../../../core/services/service/appointment.service';
import { CommonService } from '../../../../core/services/common/common.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    routing,
    DynamicAutocompleteModule,
    GlobalConfirmationModule,
  ],
  declarations: [
    AppointmentBookingFormComponent
  ],
  providers: [
    ServiceService,
    AppointmentService,
    {
      provide: MAT_DATE_LOCALE,
      deps: [CommonService],
      useFactory: ($locale: CommonService) => $locale.currentLocale()
    }
  ]

})
export class AppointmentBookingFormModule { }
