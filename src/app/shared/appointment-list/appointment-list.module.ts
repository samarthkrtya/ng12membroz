import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModule } from '../../app-material/app-material.module';

import { AppointmentListComponent } from './appointment-list.component';
import { DynamicAutocompleteModule } from '../dynamic-autocomplete/dynamic-autocomplete.module';
import { SharedModule } from '../shared.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    DynamicAutocompleteModule,
    SharedModule
  ],
  declarations: [AppointmentListComponent],
  exports: [AppointmentListComponent],
  providers: [
  ]
})

export class AppointmentListModule { }
