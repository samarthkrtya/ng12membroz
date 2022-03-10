import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './sales-channel-team-routing';
import { SalesChannelTeamComponent } from './sales-channel-team.component';

import { SharedModule } from '../../../../shared/shared.module';
import { AppMaterialModule } from '../../../../app-material/app-material.module';
import { ItemListModule } from '../../../../shared/item-list/item-list.module'
import { SaleChannelDetailsComponent } from './sales-channel-team-details/sales-channel-team-details.component';

import { SaleChannelTeamHierarchyComponent } from './sales-channel-team-hierarchy/sales-channel-team-hierarchy.component';
import { SaleschannelteamChartComponent } from './sales-channel-team-hierarchy/components/saleschannelteam-chart/saleschannelteam-chart.component';
import { SalesteamdesignationComponent } from './sales-channel-team-hierarchy/components/salesteam-designation/salesteam-designation.component';

import { SalesChannelTeamService } from '../../../../core/services/marketing/sales-channel-team.service';
import { UsersService } from '../../../../core/services/users/users.service';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    routing,
    AppMaterialModule,
    ItemListModule,
    SharedModule,
  ],
  declarations: [
    SalesChannelTeamComponent,

    SaleChannelDetailsComponent,
    SaleChannelTeamHierarchyComponent,
    SaleschannelteamChartComponent,
    SalesteamdesignationComponent,

  ],
  providers: [
    SalesChannelTeamService,
    UsersService,
  ]
})
export class SalesChannelTeamModule { }
