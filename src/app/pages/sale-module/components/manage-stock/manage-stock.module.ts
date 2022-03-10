import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './manage-stock-routing';
import { ManageStockComponent } from './manage-stock.component';

import { BillItemService } from '../../../../core/services/sale/billitem.service';
import { BillService } from '../../../../core/services/sale/bill.service';
import { BillPaymentService } from '../../../../core/services/sale/billpayment.service';
import { CommonService } from '../../../../core/services/common/common.service';
import { SharedModule } from '../../../../shared/shared.module';
import { MemberService } from '../../../../core/services/member/member.service';
import { AppMaterialModule } from '../../../../app-material/app-material.module';
import { DynamicAutocompleteModule } from '../../../../shared/dynamic-autocomplete/dynamic-autocomplete.module';
import { BillCheckoutModule } from '../../../../shared/bill-checkout/bill-checkout.module';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';


@NgModule({
  imports: [
  
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    DynamicAutocompleteModule,
    SharedModule,
    routing,
    AppMaterialModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    CommonModule

  ],
  declarations: [
    
  ],
  providers: [
    CurrencyPipe,
    BillItemService,
    MemberService,
    CommonService,
    BillService,
    BillPaymentService,
  ]
})
export class ManageStockModule { }


