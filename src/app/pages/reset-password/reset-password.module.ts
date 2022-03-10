import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './reset-password-routing';
import { ResetPasswordComponent } from './reset-password.component';
import { AppMaterialModule } from 'src/app/app-material/app-material.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    routing,
  ],
  declarations: [
    ResetPasswordComponent
  ],
  providers: [
  ]

})
export class ResetPasswordModule { }
