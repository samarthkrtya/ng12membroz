import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { routing } from './myaccount-routing';
import { MyAccountComponent } from './myaccount.component';

import { AppMaterialModule } from '../../app-material/app-material.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { CommonService } from 'src/app/core/services/common/common.service';
import { DynamicAutocompleteModule } from 'src/app/shared/dynamic-autocomplete/dynamic-autocomplete.module';


import * as _moment from 'moment';
import { default as _rollupMoment } from 'moment';
import { DateAdapter, NativeDateAdapter } from '@angular/material/core';
const moment = _rollupMoment || _moment;


class CustomDateAdapter extends NativeDateAdapter {
  format(date: Date, displayFormat: Object): string {
    var formatString = 'MM/YYYY';
    return moment(date).format(formatString);
  }
}


@NgModule({
  imports: [
    CommonModule,
    routing,
    AppMaterialModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    DynamicAutocompleteModule,
  ],
  declarations: [
    MyAccountComponent,
  ],
  providers: [
    CommonService,
    CurrencyPipe,
    {
      provide: DateAdapter, useClass: CustomDateAdapter
    }
  ]
   
})
export class MyAccountModule { }

