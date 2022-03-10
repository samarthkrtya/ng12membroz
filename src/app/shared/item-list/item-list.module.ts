import { NgModule } from '@angular/core';
import { CommonModule , DatePipe, CurrencyPipe} from '@angular/common';

import { ItemListRoutingModule } from './item-list-routing';
import { ItemListComponent } from './item-list.component';
import { CommonService } from '../../core/services/common/common.service';

import { AppMaterialModule } from '../../app-material/app-material.module';
import { SanitizeHtmlPipe } from './sanitize-html.pipe';
import { MyCurrencyPipe } from './../../shared/components/currency.pipe';

@NgModule({
  imports: [
    CommonModule,
    ItemListRoutingModule,
    AppMaterialModule
  ],
  declarations: [
    ItemListComponent,
    SanitizeHtmlPipe
  ],
  exports: [
    ItemListComponent,
    SanitizeHtmlPipe
  ],
  providers: [
    CommonService,
    DatePipe,
    MyCurrencyPipe,
    CurrencyPipe
  ]
})
export class ItemListModule { }
