import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DATE_LOCALE } from '@angular/material/core';

import { routing } from './resort-view-routing';
import { ResortViewComponent } from './resort-view.component';
import { ResortDetailComponent } from './resort-detail/resort-detail.component';
import { TariffComponent } from './tariff/tariff.component';

import { AppMaterialModule } from '../../../../app-material/app-material.module';
import { CommonService } from '../../../../core/services/common/common.service';
import { ItemListModule } from '../../../../shared/item-list/item-list.module';
import { SharedModule } from '../../../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    routing,
    ItemListModule,
    SharedModule,
  ],
  declarations: [
    ResortViewComponent,
    ResortDetailComponent,
    TariffComponent,
  ],
  exports : [
    
  ],
  providers: [
     {
      provide: MAT_DATE_LOCALE,
      deps: [CommonService],
       useFactory: ($locale: CommonService) => $locale.currentLocale()
     }
  ]
})
export class ResortViewModule { }
