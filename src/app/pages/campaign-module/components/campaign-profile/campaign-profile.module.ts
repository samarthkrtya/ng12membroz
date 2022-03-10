import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './campaign-profile-routing';

import { CampaignProfileComponent } from './campaign-profile.component';
import { CampaignBasicDetailsComponent } from './components/campaign-basic-details/campaign-basic-details.component';
import { CampaignLeadListsComponent } from './components/campaign-lead-lists/campaign-lead-lists.component';
import { CampaignTimelineComponent } from './components/campaign-timeline/campaign-timeline.component';

import { AppMaterialModule } from '../../../../app-material/app-material.module';
import { ItemListModule } from '../../../../shared/item-list/item-list.module'

import { DynamicAutocompleteModule } from '../../../../shared/dynamic-autocomplete/dynamic-autocomplete.module';
import { DynamicDispositionformModule } from '../../../../shared/dynamic-dispositionform/dynamic-dispositionform.module';
import { SharedModule } from '../../../../shared/shared.module';

import { KeysPipe } from './keys.pipe';
import { SaleChannelTeamHierarchyComponent } from './components/sales-channel-team-hierarchy/sales-channel-team-hierarchy.component';
import { SaleschannelteamChartComponent } from './components/sales-channel-team-hierarchy/components/saleschannelteam-chart/saleschannelteam-chart.component';
import { SalesteamdesignationComponent } from './components/sales-channel-team-hierarchy/components/salesteam-designation/salesteam-designation.component';

@NgModule({
  imports: [
    CommonModule,
    routing,
    AppMaterialModule,
    ItemListModule,
    FormsModule,
    ReactiveFormsModule,
    DynamicAutocompleteModule,
    DynamicDispositionformModule,
    SharedModule
  ],
  declarations: [
    CampaignProfileComponent,
    CampaignBasicDetailsComponent,
    CampaignLeadListsComponent,
    CampaignTimelineComponent,
    KeysPipe,
    SaleChannelTeamHierarchyComponent,
    SaleschannelteamChartComponent,
    SalesteamdesignationComponent,
  ],
  exports: [
    CampaignBasicDetailsComponent,
    CampaignLeadListsComponent,
    CampaignTimelineComponent,
    KeysPipe
  ],
  providers: [
    CurrencyPipe
  ]
})
export class CampaignProfileModule { }
