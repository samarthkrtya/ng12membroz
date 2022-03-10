import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicPropertyFieldsComponent } from './dynamic-property-fields.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModule } from '../../app-material/app-material.module';

import { FileUploadModule } from 'ng2-file-upload';
import { Cloudinary } from 'cloudinary-core';
import { CloudinaryModule } from '@cloudinary/angular-5.x';
import { config } from '../../config';
const cloudinaryLib = { Cloudinary: Cloudinary};
import { AngularEditorModule } from '@kolkov/angular-editor';

import { DynamicAutocompleteModule } from '../../shared/dynamic-autocomplete/dynamic-autocomplete.module';

import {
  NgxMatDatetimePickerModule, 
  NgxMatNativeDateModule, 
  NgxMatTimepickerModule 
} from '@angular-material-components/datetime-picker';

@NgModule({
  
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    CloudinaryModule.forRoot(cloudinaryLib, config),
    FileUploadModule,
    AngularEditorModule,
    DynamicAutocompleteModule,
    NgxMatDatetimePickerModule,
    NgxMatNativeDateModule,
    NgxMatTimepickerModule
  ],
  declarations: [DynamicPropertyFieldsComponent],
  exports: [DynamicPropertyFieldsComponent]
})
export class DynamicPropertyFieldsModule { }
