import { CommonModule, DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModule } from 'src/app/app-material/app-material.module';
import { ItemListModule } from 'src/app/shared/item-list/item-list.module';
import { SharedModule } from 'src/app/shared/shared.module';

import { routing } from './package-itinerary-routing';
import { PackageItineraryComponent } from './package-itinerary.component';

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
    PackageItineraryComponent,
  ],
  exports: [ 
  ],
  providers: [
    DatePipe
  ]
})
export class  PackageItineraryModule { }


