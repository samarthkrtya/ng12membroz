import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';


import { MatOptionSelectAllComponent } from './mat-option-select-all.component';

import { AppMaterialModule } from '../../app-material/app-material.module'


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AppMaterialModule
  ],
  declarations: [
    MatOptionSelectAllComponent
  ],
  exports: [
    MatOptionSelectAllComponent
  ],

})
export class MatOptionSelectAllModule { }
