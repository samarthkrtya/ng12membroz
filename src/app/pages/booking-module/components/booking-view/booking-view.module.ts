import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './booking-view-routing';
import { BookingViewComponent } from './booking-view.component';
import { BookingDetailsComponent } from './booking-details/booking-details.component';
import { AppMaterialModule } from '../../../../app-material/app-material.module';
import { BookingService } from '../../../../core/services/service/booking.service';
import { ItemListModule } from '../../../../shared/item-list/item-list.module'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    routing,
    ItemListModule,
  ],
  declarations: [
    BookingViewComponent,
    BookingDetailsComponent,
  ],
  providers: [
    BookingService,
  ]
})
export class BookingViewModule { }
