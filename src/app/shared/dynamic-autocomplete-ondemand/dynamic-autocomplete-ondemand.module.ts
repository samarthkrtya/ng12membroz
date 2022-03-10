import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DynamicAutocompleteOndemandRoutingModule } from './dynamic-autocomplete-ondemand-routing';
import { DynamicAutocompleteOndemandComponent } from './dynamic-autocomplete-ondemand.component';

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
    DynamicAutocompleteOndemandRoutingModule,
    AppMaterialModule,
    SharedModule,
  ],
  declarations: [
    DynamicAutocompleteOndemandComponent,
  ],
  exports: [
    DynamicAutocompleteOndemandComponent,
  ],
  providers: [
    FormdataService,
    LookupsService,
    CommonService,
  ]
})
export class DynamicAutocompleteOndemandModule {
  static forRoot(): ModuleWithProviders<unknown> {
    return {
      ngModule: DynamicAutocompleteOndemandModule,
      providers: [
        FormdataService,
      LookupsService,
      CommonService,
      ]
    };
  }
}
