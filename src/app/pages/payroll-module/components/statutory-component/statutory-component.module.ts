import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './statutory-component-routing';
import { StatutoryComponentComponent } from './statutory-component.component';

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
    StatutoryComponentComponent,
  ],
  providers: [
    
  ]

})
export class StatutoryComponentModule { }


