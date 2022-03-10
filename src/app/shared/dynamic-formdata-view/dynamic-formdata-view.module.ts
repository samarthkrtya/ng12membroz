import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DynamicFormdataViewComponent } from './dynamic-formdata-view.component';
import { SharedModule } from '../shared.module';
import { AppMaterialModule } from '../../app-material/app-material.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    SharedModule,
  ],
  declarations: [
    DynamicFormdataViewComponent
  ],
  exports: [
    DynamicFormdataViewComponent
  ],
  providers: [ 
  ]
})


export class DynamicFormdataViewModule { }
