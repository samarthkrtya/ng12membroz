import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './billing-routing';
import { BillingComponent } from './billing.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    routing
  ],
  declarations: [
    BillingComponent
  ],
  providers: [
    CurrencyPipe,
  ]

})
export class BillingModule { }
