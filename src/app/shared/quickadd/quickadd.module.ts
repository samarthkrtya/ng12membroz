import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QuickaddComponent } from './quickadd.component';

// File upload module
import {FileUploadModule} from 'ng2-file-upload';
// Cloudinary module
import { Cloudinary } from 'cloudinary-core';
import { CloudinaryModule, CloudinaryConfiguration } from '@cloudinary/angular-5.x';

import { config } from '../../config';

import { AppMaterialModule } from '../../app-material/app-material.module'

import {
  NgxMatDatetimePickerModule, 
  NgxMatNativeDateModule, 
  NgxMatTimepickerModule 
} from '@angular-material-components/datetime-picker';

const cloudinaryLib = {
    Cloudinary: Cloudinary
};
@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    CloudinaryModule.forRoot(cloudinaryLib, config),
    FileUploadModule,
    AppMaterialModule,
    NgxMatDatetimePickerModule,
    NgxMatNativeDateModule,
    NgxMatTimepickerModule
  ],
  declarations: [
    QuickaddComponent
  ],
  exports: [
    QuickaddComponent
  ]
})
export class QuickaddModule { }
