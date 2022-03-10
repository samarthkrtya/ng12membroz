import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { GlobalConfirmationComponent } from './global-confirmation.component';

import { AppMaterialModule } from '../../app-material/app-material.module';

@NgModule({
  imports: [
    CommonModule,
    AppMaterialModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    GlobalConfirmationComponent
  ],
  exports: [
    GlobalConfirmationComponent
  ]
})
export class GlobalConfirmationModule { }
