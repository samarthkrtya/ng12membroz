import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './inspection-estimation-info-render-routing';
import { InspectionEstimationInfoRenderComponent } from './inspection-estimation-info-render.component';

import { AppMaterialModule } from '../../../../app-material/app-material.module';
import { DynamicAutocompleteModule } from '../../../../shared/dynamic-autocomplete/dynamic-autocomplete.module';

import { QuickaddModule } from '../../../../shared/quickadd/quickadd.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    routing,
    DynamicAutocompleteModule,
    QuickaddModule
  ],
  declarations: [
    InspectionEstimationInfoRenderComponent,
  ],
  providers: [
    CurrencyPipe,
  ]

})
export class InspectionEstimationInfoRenderModule { }