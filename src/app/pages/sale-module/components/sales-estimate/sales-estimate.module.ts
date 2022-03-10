import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './sales-estimate-routing';
import { SalesEstimateComponent } from './sales-estimate.component';

import { SharedModule } from '../../../../shared/shared.module';
import { BillItemService } from '../../../../core/services/sale/billitem.service';
import { CommonService } from '../../../../core/services/common/common.service';
import { BillService } from '../../../../core/services/sale/bill.service';
import { ServiceService } from '../../../../core/services/service/service.service';
import { AppMaterialModule } from '../../../../app-material/app-material.module';
import { MatOptionSelectAllModule } from '../../../../shared/mat-option-select-all/mat-option-select-all.module';
import { AssetService } from '../../../../core/services/service/asset.service';
import { MAT_DATE_LOCALE } from '@angular/material/core'; 

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule, 
    SharedModule,
    routing,
    MatOptionSelectAllModule,
  ],
  declarations: [
    SalesEstimateComponent,
  ],
  providers: [
    CurrencyPipe,
    BillItemService,
    ServiceService,
    AssetService,
    CommonService,
    BillService,
    {
      provide: MAT_DATE_LOCALE,
      deps: [CommonService],
      useFactory: ($locale: CommonService) => $locale.currentLocale()
    }
  ]

})
export class SalesEstimateModule { }