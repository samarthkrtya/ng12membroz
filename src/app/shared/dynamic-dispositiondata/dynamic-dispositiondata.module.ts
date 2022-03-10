import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DynamicDispositiondataComponent } from './dynamic-dispositiondata.component';

import { DynamicAutocompleteModule } from '../dynamic-autocomplete/dynamic-autocomplete.module';
import { AppMaterialModule } from '../../app-material/app-material.module';
import { FilterPipe } from './filter.pipe';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    DynamicAutocompleteModule,
  ],
  declarations: [
    DynamicDispositiondataComponent,
    FilterPipe
  ],
  exports: [
    DynamicDispositiondataComponent,
  ]
})
export class DynamicDispositiondataModule { }
