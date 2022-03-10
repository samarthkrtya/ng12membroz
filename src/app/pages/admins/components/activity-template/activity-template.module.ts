import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { routing } from './activity-template-routing';
import { ActivityTemplateComponent } from './activity-template.component';
import { AppMaterialModule } from '../../../../app-material/app-material.module';

import { DynamicAutocompleteModule } from '../../../../shared/dynamic-autocomplete/dynamic-autocomplete.module';

import { FileUploadModule } from 'ng2-file-upload';
import { Cloudinary } from 'cloudinary-core';
import { CloudinaryModule } from '@cloudinary/angular-5.x';
import { AngularEditorModule } from '@kolkov/angular-editor';

import { config } from '../../../../config';


const cloudinaryLib = {
  Cloudinary: Cloudinary
};



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    routing,
    FileUploadModule,
    AppMaterialModule,
    AngularEditorModule,
    CloudinaryModule.forRoot(cloudinaryLib, config),
    
    DynamicAutocompleteModule
  ],
  declarations: [
    ActivityTemplateComponent
  ],
  providers: [
  ]

})
export class ActivityTemplateModule { }
