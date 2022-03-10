import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ResetPasswordComponent } from './reset-password.component';

import { AppMaterialModule } from '../../app-material/app-material.module';

@NgModule({
  imports: [
    CommonModule,
    AppMaterialModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    ResetPasswordComponent
  ],
  exports: [
    ResetPasswordComponent
  ]
})
export class ResetPasswordModule { }
