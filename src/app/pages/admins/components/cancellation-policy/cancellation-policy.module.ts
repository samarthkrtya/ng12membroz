import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './cancellation-policy-routing';
import { CancellationPolicyComponent } from './cancellation-policy.component';

import { AppMaterialModule } from '../../../../app-material/app-material.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    routing,
    AppMaterialModule,
  ],
  declarations: [
    CancellationPolicyComponent
  ],
  providers: [
  ]

})
export class CancellationPolicyModule { }
