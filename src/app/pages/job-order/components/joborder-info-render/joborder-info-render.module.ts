import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './joborder-info-render-routing';
import { JoborderInfoRenderComponent } from './joborder-info-render.component';

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
    JoborderInfoRenderComponent,
  ],
  providers: [
    CurrencyPipe,
  ]

})
export class JoborderInfoRenderModule { }