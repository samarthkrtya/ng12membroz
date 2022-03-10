import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './manage-sales-routing';
import { ManageSalesComponent } from './manage-sales.component';

import { BillItemService } from '../../../../core/services/sale/billitem.service';
import { BillService } from '../../../../core/services/sale/bill.service';
import { BillPaymentService } from '../../../../core/services/sale/billpayment.service';
import { SharedModule } from '../../../../shared/shared.module';
import { AppMaterialModule } from '../../../../app-material/app-material.module';
import { BillIOUCheckoutModule } from '../../../../shared/bill-iou-checkout/bill-iou-checkout.module';
import { BillCheckOutModule } from '../../../../shared/bill-check-out/bill-check-out.module';
import { DynamicPropertyFieldsModule } from '../../../../shared/dynamic-property-fields/dynamic-property-fields.module';
import { DynamicAutocompleteModule } from '../../../../shared/dynamic-autocomplete/dynamic-autocomplete.module';

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
    DynamicAutocompleteModule,
    DynamicPropertyFieldsModule,
  ],
  declarations: [
    ManageSalesComponent,
  ],
  providers: [
    CurrencyPipe,
    BillItemService,
    BillService,
    BillPaymentService
  ]
})
export class ManageSalesModule { }


