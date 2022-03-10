import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './inspection-page-routing';
import { InspectionPageComponent } from './inspection-page.component';
import { InspectionFormbuilderComponent } from './inspection-formbuilder/inspection-formbuilder.component';
import { AppMaterialModule } from '../../../../app-material/app-material.module';

import { FileUploadModule } from 'ng2-file-upload';
import { Cloudinary } from 'cloudinary-core';
import { CloudinaryModule } from '@cloudinary/angular-5.x';
import { config } from '../../../../config';
const cloudinaryLib = { Cloudinary: Cloudinary };

import { InspectionAssetsModule } from '../../../../shared/inspection-assets/inspection-assets.module';
import { DynamicAutocompleteModule } from '../../../../shared/dynamic-autocomplete/dynamic-autocomplete.module';

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
    routing,
    AppMaterialModule,    
    CloudinaryModule.forRoot(cloudinaryLib, config),
    FileUploadModule,
    InspectionAssetsModule,
    DynamicAutocompleteModule,
    NgxMatDatetimePickerModule,
    NgxMatNativeDateModule,
    NgxMatTimepickerModule
  ],
  declarations: [
    InspectionPageComponent,
    InspectionFormbuilderComponent
  ],
  exports: [
    InspectionFormbuilderComponent
  ],
  providers: [
  ]

})
export class InspectionPageModule { }
