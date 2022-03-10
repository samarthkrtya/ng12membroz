import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './product-view-routing';
import { ProductViewComponent } from './product-view.component';
import { AppMaterialModule } from '../../../../app-material/app-material.module';
import { BillItemService } from '../../../../core/services/sale/billitem.service';
import { ItemListModule } from '../../../../shared/item-list/item-list.module'
import { DocTableComponent } from './doc-table/doc-table.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    routing,
    ItemListModule,
  ],
  declarations: [
    ProductViewComponent,
    DocTableComponent
  ],
  exports :[
    DocTableComponent
  ],
  providers: [
    BillItemService
  ]

})
export class ProductViewModule { }
