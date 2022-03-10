import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './holiday-package-view-routing';
import { HolidayPackageViewComponent } from './holiday-package-view.component';

import { AppMaterialModule } from '../../../../app-material/app-material.module';

import { MAT_DATE_LOCALE } from '@angular/material/core';
import { CommonService } from '../../../../core/services/common/common.service';
import { ItemListModule } from 'src/app/shared/item-list/item-list.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { PackageBasicDetailsComponent } from './package-basic-details/package-basic-details.component';

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
    HolidayPackageViewComponent,
    PackageBasicDetailsComponent,

  ],
  providers: [
      CurrencyPipe,
     {
      provide: MAT_DATE_LOCALE,
      deps: [CommonService],
       useFactory: ($locale: CommonService) => $locale.currentLocale()
     }
  ]
})
export class HolidayPackageViewModule { }
