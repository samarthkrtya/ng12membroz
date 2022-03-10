import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import {LeadModuleRoutes  } from './lead-module-routing';
import { LeadModuleComponent } from './lead-module.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(LeadModuleRoutes),
  ],
  declarations: [
    LeadModuleComponent,
  ],
})
export class LeadModuleModule { }