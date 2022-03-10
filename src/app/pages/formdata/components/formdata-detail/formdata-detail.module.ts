import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './formdata-detail-routing';
import { FormdataDetailComponent } from './formdata-detail.component';

import { AppMaterialModule } from '../../../../app-material/app-material.module';
import { ItemListModule } from '../../../../shared/item-list/item-list.module'


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    routing,
    AppMaterialModule,
    ItemListModule
  ],
  declarations: [
    FormdataDetailComponent,
  ],
  providers: [
  ]
})

export class FormdataDetailModule { }
