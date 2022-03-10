import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './reset-pass-setting-routing';
import { ResetPassSettingComponent } from './reset-pass-setting.component';
import { AppMaterialModule } from '../../../../app-material/app-material.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    routing,
  ],
  declarations: [
    ResetPassSettingComponent
  ],
  providers: [
  ]

})
export class ResetPassSettingModule { }
