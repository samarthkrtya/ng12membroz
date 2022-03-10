import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { GlobalSearchbarComponent } from './global-searchbar.component';

import { AppMaterialModule } from '../../app-material/app-material.module';

@NgModule({
  imports: [
    CommonModule,
    AppMaterialModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    GlobalSearchbarComponent
  ],
  exports: [
    GlobalSearchbarComponent
  ]
})
export class GlobalSearchbarModule { }
