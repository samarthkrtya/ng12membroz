import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './sales-channel-routing';
import { SalesChannelComponent } from './sales-channel.component';

import { SharedModule } from '../../../../shared/shared.module';
import { AppMaterialModule } from '../../../../app-material/app-material.module';
import { ItemListModule } from '../../../../shared/item-list/item-list.module'
import { SaleChannelDetailsComponent } from './sales-channel-basic-details/sales-channel-details.component';
import { SalesChannelService } from '../../../../core/services/marketing/sales-channel.service';
import { SaleChannelHierarchyComponent } from './sales-channel-hierarchy/sales-channel-hierarchy.component';

import { SaleschannelChartComponent } from './sales-channel-hierarchy/components/saleschannel-chart/saleschannel-chart.component';
import { SalesdesignationComponent } from './sales-channel-hierarchy/components/salesdesignation/salesdesignation.component';
import { DynamicAutocompleteModule } from '../../../../shared/dynamic-autocomplete/dynamic-autocomplete.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    routing,
    AppMaterialModule,
    ItemListModule,
    SharedModule,
    DynamicAutocompleteModule
  ],
  declarations: [
    SalesChannelComponent,
    SaleChannelDetailsComponent,
    SaleChannelHierarchyComponent,

    SaleschannelChartComponent,
    SalesdesignationComponent,
  ],
  providers: [
    SalesChannelService,

  ]
})
export class SalesChannelModule { }
