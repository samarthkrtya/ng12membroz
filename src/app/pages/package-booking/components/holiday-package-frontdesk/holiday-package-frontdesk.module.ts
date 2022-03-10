import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './holiday-package-frontdesk-routing';
import { HolidayPackageFrontdeskComponent } from './holiday-package-frontdesk.component';

import { AppMaterialModule } from '../../../../app-material/app-material.module';

import { MAT_DATE_LOCALE } from '@angular/material/core';
import { CommonService } from '../../../../core/services/common/common.service';
import { SharedModule } from '../../../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    routing,
    SharedModule,
  ],
  declarations: [
    HolidayPackageFrontdeskComponent,
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
export class HolidayPackageFrontdeskModule { }
