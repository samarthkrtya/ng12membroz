import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './inspection-template-lists-routing';
import { InspectionTemplateListsComponent } from './inspection-template-lists.component';

import { AppMaterialModule } from '../../../../app-material/app-material.module';
import { DynamicAutocompleteModule } from '../../../../shared/dynamic-autocomplete/dynamic-autocomplete.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    routing,
    DynamicAutocompleteModule
  ],
  declarations: [
    InspectionTemplateListsComponent,
  ],
  providers: [
    CurrencyPipe,
  ]

})
export class InspectionTemplateListsModule { }