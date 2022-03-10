import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './lookup-routing';
import { LookupComponent } from './lookup.component';
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
    LookupComponent
  ],
})
export class LookupModule { }
