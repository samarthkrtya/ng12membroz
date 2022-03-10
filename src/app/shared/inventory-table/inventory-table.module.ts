import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModule } from '../../app-material/app-material.module';

import { InventoryTableComponent } from './inventory-table.component';
import { DynamicAutocompleteModule } from '../dynamic-autocomplete/dynamic-autocomplete.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    DynamicAutocompleteModule,
  ],
  declarations: [InventoryTableComponent],
  exports: [InventoryTableComponent],
  providers: [

  ]
})

export class InventoryTableModule { }
