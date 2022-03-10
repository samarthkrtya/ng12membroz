import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppointmentBookingComponent } from './appointment-booking.component';
import { AppointmentResourceListsComponent } from './appointment-resource-lists/appointment-resource-lists.component';
import { AppointmentHostsListsComponent } from './appointment-hosts-lists/appointment-hosts-lists.component';

import { DynamicAutocompleteModule } from '../../shared/dynamic-autocomplete/dynamic-autocomplete.module';
import { AppMaterialModule } from '../../app-material/app-material.module';
import { SharedModule } from '../shared.module';

import { MAT_DATE_LOCALE} from '@angular/material/core';
import { CommonService } from '../../core/services/common/common.service';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DynamicAutocompleteModule,
    AppMaterialModule,
    SharedModule,
    HttpClientModule
  ],
  declarations: [
    AppointmentBookingComponent, 
    AppointmentResourceListsComponent, 
    AppointmentHostsListsComponent
  ],
  exports: [
    AppointmentBookingComponent, 
    AppointmentResourceListsComponent, 
    AppointmentHostsListsComponent
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
export class AppointmentBookingModule { }
