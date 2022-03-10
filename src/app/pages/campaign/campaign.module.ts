import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import {  CampaignRoutes } from './campaign.routing';
import { CampaignComponent } from './campaign.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(CampaignRoutes),
  ],
  declarations: [
    CampaignComponent,
  ],
})
export class CampaignModule { }