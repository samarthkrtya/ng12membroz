import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './inspetion-estimation-routing';
import { InspetionEstimationComponent } from './inspetion-estimation.component';

import { AppMaterialModule } from '../../../../app-material/app-material.module';

import { SharedModule } from '../../../../shared/shared.module';
import { BillItemService } from '../../../../core/services/sale/billitem.service';
import { CommonService } from '../../../../core/services/common/common.service';
import { BillService } from '../../../../core/services/sale/bill.service';
import { ServiceService } from '../../../../core/services/service/service.service';
import { MatOptionSelectAllModule } from '../../../../shared/mat-option-select-all/mat-option-select-all.module';
import { AssetService } from '../../../../core/services/service/asset.service';
import { MAT_DATE_LOCALE } from '@angular/material/core'; 
import { InspectionAssetsModule } from '../../../../shared/inspection-assets/inspection-assets.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    routing,
    SharedModule,
    AppMaterialModule,
    routing,
    MatOptionSelectAllModule,
    InspectionAssetsModule
  ],
  declarations: [
    InspetionEstimationComponent,
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
export class InspetionEstimationModule { }
