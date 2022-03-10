import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { WorkingDaysComponent } from './workingdays.component';

import { AppMaterialModule } from '../../app-material/app-material.module';

@NgModule({
  imports: [
    CommonModule,
    AppMaterialModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  declarations: [
    WorkingDaysComponent
  ],
  exports: [
    WorkingDaysComponent
  ]
})
export class WorkingDaysModule { }
