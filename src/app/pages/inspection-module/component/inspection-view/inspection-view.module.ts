import { CommonModule, DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModule } from 'src/app/app-material/app-material.module';
import { ItemListModule } from 'src/app/shared/item-list/item-list.module';
import { SharedModule } from 'src/app/shared/shared.module';

import { routing } from './inspection-view-routing';
import { InspectionViewComponent } from './inspection-view.component';

import { SafeHtmlPipe } from "./safehtml.pipe";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    ItemListModule,
    routing,
    SharedModule,
  ],
  declarations: [
    InspectionViewComponent,
    SafeHtmlPipe
  ],
  exports: [ 
  ],
  providers: [
    DatePipe
  ]
})
export class  InspectionViewModule { }


