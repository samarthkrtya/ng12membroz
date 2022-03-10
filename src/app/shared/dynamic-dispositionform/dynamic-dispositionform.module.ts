import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DynamicDispositionformComponent } from './dynamic-dispositionform.component';

import { DynamicAutocompleteModule } from '../dynamic-autocomplete/dynamic-autocomplete.module';
import { AppMaterialModule } from '../../app-material/app-material.module';

import {FileUploadModule} from 'ng2-file-upload';
import { Cloudinary } from 'cloudinary-core';
import { CloudinaryModule } from '@cloudinary/angular-5.x';
import { config } from '../../config';
const cloudinaryLib = { Cloudinary: Cloudinary};
import { KeysPipe } from './keys.pipe';


import {
  NgxMatDatetimePickerModule, 
  NgxMatNativeDateModule, 
  NgxMatTimepickerModule 
} from '@angular-material-components/datetime-picker';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    DynamicAutocompleteModule,
    CloudinaryModule.forRoot(cloudinaryLib, config),
    FileUploadModule,
    NgxMatDatetimePickerModule,
    NgxMatNativeDateModule,
    NgxMatTimepickerModule
  ],
  declarations: [
    DynamicDispositionformComponent,
    KeysPipe
  ],
  exports: [
    DynamicDispositionformComponent,
    KeysPipe
  ]
})
export class DynamicDispositionformModule { }
