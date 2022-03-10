import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './salary-component-routing';
import { SalaryComponentComponent } from './salary-component.component';

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
    SalaryComponentComponent
  ],
  providers: [
    
  ]

})
export class SalaryComponentModule { }

