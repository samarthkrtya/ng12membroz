import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DATE_LOCALE} from '@angular/material/core';

import { routing } from './event-booking-routing';
import { EventBookingComponent } from './event-booking.component';
import { SharedModule } from '../../../../shared/shared.module';
import { AppMaterialModule } from '../../../../app-material/app-material.module';
import { CommonService } from '../../../../core/services/common/common.service';
import { DynamicAutocompleteModule  } from '../../../../shared/dynamic-autocomplete/dynamic-autocomplete.module';
import { GlobalConfirmationModule } from '../../../../shared/global-confirmation/global-confirmation.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    routing,
    SharedModule,
    DynamicAutocompleteModule,
    GlobalConfirmationModule
  ],
  declarations: [
    EventBookingComponent
  ],
  providers: [
    CurrencyPipe,
    CommonService,
    {
      provide: MAT_DATE_LOCALE,
      deps: [CommonService],
      useFactory: ($locale: CommonService) => $locale.currentLocale()
    }
  ]

})
export class EventBookingModule { }
