import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DynamicOperationRoutingModule } from './dynamic-operation-routing';
import { DynamicOperationComponent } from './dynamic-operation.component';

import { SearchFilterComponent } from './components/search-filter/search-filter.component';
import { SelectFieldsComponent } from './components/select-fields/select-fields.component';
import { SearchFilterRenderComponent } from './components/search-filter-render/search-filter-render.component';
import { SortingComponent } from './components/sorting/sorting.component';

import { FormlistService } from '../../core/services/formlist/formlist.service';

import { AppMaterialModule } from '../../app-material/app-material.module';
import { DynamicAutocompleteModule } from '../dynamic-autocomplete/dynamic-autocomplete.module';

import { DragulaModule, DragulaService } from 'ng2-dragula';
import { SearchReportFilterRenderComponent } from './components/search-report-filter-render/search-report-filter-render.component';

import { ReportSelectFieldsComponent } from './components/report-select-fields/report-select-fields.component';
import { ReportFilterFieldsComponent } from './components/report-filter-fields/report-filter-fields.component';
import { ReportSortFieldsComponent } from './components/report-sort-fields/report-sort-fields.component';
import { RootFieldsComponent } from './components/root-fields/root-fields.component';

import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';


@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    DynamicOperationRoutingModule,
    DragulaModule,
    AppMaterialModule,
    DynamicAutocompleteModule,
    NgxDaterangepickerMd.forRoot()

  ],
  declarations: [
    DynamicOperationComponent,
    SearchFilterComponent,
    SelectFieldsComponent,
    SortingComponent,
    SearchFilterRenderComponent,
    SearchReportFilterRenderComponent,

    ReportSelectFieldsComponent,
    ReportFilterFieldsComponent,
    ReportSortFieldsComponent,
    RootFieldsComponent
  ],
  exports: [
    SearchFilterComponent,
    SelectFieldsComponent,
    SortingComponent,
    SearchFilterRenderComponent,
    SearchReportFilterRenderComponent,

    ReportSelectFieldsComponent,
    ReportFilterFieldsComponent,
    ReportSortFieldsComponent,
    RootFieldsComponent

  ],
  providers: [
    FormlistService,
    DragulaService,
  ]
})
export class DynamicOperationModule {
  static forRoot(): ModuleWithProviders<unknown> {
    return {
      ngModule: DynamicOperationModule,
      providers: [
        FormlistService,
        DragulaService,
      ]
    };
  }
}


