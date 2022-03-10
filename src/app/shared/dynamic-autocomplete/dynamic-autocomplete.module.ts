import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DynamicAutocompleteRoutingModule } from './dynamic-autocomplete-routing';
import { DynamicAutocompleteComponent } from './dynamic-autocomplete.component';
import { DynamicAutocompleteNgmodelComponent } from './dynamic-autocomplete-ngmodel/dynamic-autocomplete-ngmodel.component';

import { CommonService } from '../../core/services/common/common.service';
import { LookupsService } from '../../core/services/lookups/lookup.service';
import { FormdataService } from './../../core/services/formdata/formdata.service';

import { AppMaterialModule } from '../../app-material/app-material.module';
import { SharedModule } from '../shared.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    DynamicAutocompleteRoutingModule,
    AppMaterialModule,
    SharedModule,
  ],
  declarations: [
    DynamicAutocompleteComponent,
    DynamicAutocompleteNgmodelComponent,
  ],
  exports: [
    DynamicAutocompleteComponent,
    DynamicAutocompleteNgmodelComponent
  ],
  providers: [
    FormdataService,
    LookupsService,
    CommonService,
  ]
})
export class DynamicAutocompleteModule {
  static forRoot(): ModuleWithProviders<unknown> {
    return {
      ngModule: DynamicAutocompleteModule,
      providers: [
        FormdataService,
      LookupsService,
      CommonService,
      ]
    };
  }
}



