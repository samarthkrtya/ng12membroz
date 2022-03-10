import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './vehicle-profile-routing';

import { VehicleProfileComponent } from './vehicle-profile.component';
import { VehicleBasicDetailsComponent } from './components/vehicle-basic-details/vehicle-basic-details.component';

import { VehicleBookingListsComponent } from './components/vehicle-booking-lists/vehicle-booking-lists.component';
import { VehicleInspectionListsComponent } from './components/vehicle-inspection-lists/vehicle-inspection-lists.component';
import { VehicleEstimationListsComponent } from './components/vehicle-estimation-lists/vehicle-estimation-lists.component';
import { VehicleJoborderListsComponent } from './components/vehicle-joborder-lists/vehicle-joborder-lists.component';

import { AppMaterialModule } from '../../../../app-material/app-material.module';
import { ItemListModule } from '../../../../shared/item-list/item-list.module'

import { FileUploadModule } from 'ng2-file-upload';
import { Cloudinary } from 'cloudinary-core';
import { CloudinaryModule } from '@cloudinary/angular-5.x';
import { config } from '../../../../config';
import { VehicleWarrentyListsComponent } from './components/vehicle-warrenty-lists/vehicle-warrenty-lists.component';
import { SharedModule } from 'src/app/shared/shared.module';
const cloudinaryLib = { Cloudinary: Cloudinary };

@NgModule({
  imports: [
    CommonModule,
    routing,
    AppMaterialModule,
    ItemListModule,
    FormsModule,
    ReactiveFormsModule,
    CloudinaryModule.forRoot(cloudinaryLib, config),
    FileUploadModule,
    SharedModule,
  ],
  declarations: [
    VehicleProfileComponent,
    VehicleBasicDetailsComponent,
    VehicleBookingListsComponent,
    VehicleInspectionListsComponent,
    VehicleEstimationListsComponent,
    VehicleJoborderListsComponent,
    VehicleWarrentyListsComponent,
  ],
  exports: [
    VehicleBasicDetailsComponent,
    VehicleBookingListsComponent,
    VehicleInspectionListsComponent,
    VehicleEstimationListsComponent,
    VehicleJoborderListsComponent,
    VehicleWarrentyListsComponent,
  ],
  providers: [
  ]
})
export class VehicleProfileModule { }

