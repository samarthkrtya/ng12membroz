import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './leave-policy-routing';
import { LeavePolicyComponent } from './leave-policy.component';
import { AppMaterialModule } from '../../../../app-material/app-material.module';
import { SharedModule } from '../../../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    routing,
    SharedModule,
  ],
  declarations: [
    LeavePolicyComponent
  ],
  providers: [
  ]

})
export class LeavePolicyModule { }
