import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { CampaignModuleRoutes  } from './campaign-module-routing';
import { CampaignModuleComponent } from './campaign-module.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(CampaignModuleRoutes),
  ],
  declarations: [
    CampaignModuleComponent
  ],
})
export class CampaignModuleModule { }