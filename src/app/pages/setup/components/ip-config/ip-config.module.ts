import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './ip-config-routing';
import { IPConfigComponent } from './ip-config.component';
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
    IPConfigComponent
  ],
})
export class IPConfigModule { }
