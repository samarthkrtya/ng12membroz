import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DATE_LOCALE} from '@angular/material/core';

import { routing } from './appointment-view-routing';
import { AppointmentViewComponent } from './appointment-view.component';
import { AppMaterialModule } from '../../../../app-material/app-material.module';
import { CommonService } from '../../../../core/services/common/common.service';
import { ItemListModule } from '../../../../shared/item-list/item-list.module';
import { SharedModule } from '../../../../shared/shared.module';
import { ModalListModule } from 'src/app/shared/modal-list/modal-list.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    ItemListModule,
    routing,
    SharedModule,
    ModalListModule
  ],
  declarations: [
    AppointmentViewComponent
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
export class AppointmentViewModule { }
