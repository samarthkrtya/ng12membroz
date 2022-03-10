import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { FacilityBookingMultipleComponent } from './facility-booking-multiple.component';

import { DynamicAutocompleteModule } from '../dynamic-autocomplete/dynamic-autocomplete.module';
import { AppMaterialModule } from '../../app-material/app-material.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DynamicAutocompleteModule,
    AppMaterialModule
  ],
  declarations: [
    FacilityBookingMultipleComponent
  ],
  exports:[
    FacilityBookingMultipleComponent
  ]
})
export class FacilityBookingMultipleModule { }
