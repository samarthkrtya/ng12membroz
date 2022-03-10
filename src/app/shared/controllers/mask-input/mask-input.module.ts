import { NgModule, ModuleWithProviders, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModule } from 'src/app/app-material/app-material.module';
import { MaskInputComponent } from './mask-input.component';

import { NgxMaskModule, IConfig } from 'ngx-mask' 

export const options: Partial<IConfig> | (() => Partial<IConfig>) = null;
 
 

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    NgxMaskModule.forRoot(),
  ],
  declarations: [
    MaskInputComponent, 
  ],
  exports: [
    MaskInputComponent, 
  ],
  providers: [ 
  ]
})

export class MaskInputModule {}



