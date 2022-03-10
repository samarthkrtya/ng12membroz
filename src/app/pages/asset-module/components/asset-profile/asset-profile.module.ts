import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './asset-profile-routing';

import { AssetProfileComponent } from './asset-profile.component';
import { AssetBasicDetailsComponent } from './components/asset-basic-details/asset-basic-details.component';

import { AppMaterialModule } from '../../../../app-material/app-material.module';
import { ItemListModule } from '../../../../shared/item-list/item-list.module'

import {FileUploadModule} from 'ng2-file-upload';
import { Cloudinary } from 'cloudinary-core';
import { CloudinaryModule } from '@cloudinary/angular-5.x';
import { config } from '../../../../config';
const cloudinaryLib = { Cloudinary: Cloudinary};

import { AvailabilityCalendarModule } from '../../../../shared/availability-calendar/availability-calendar.module';

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
    AvailabilityCalendarModule
  ],
  declarations: [
    AssetProfileComponent,
    AssetBasicDetailsComponent,
  ],
  exports: [
    AssetBasicDetailsComponent,
  ],
  providers: [
  ]
})
export class AssetProfileModule { }
