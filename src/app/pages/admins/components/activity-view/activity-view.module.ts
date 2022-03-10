import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { routing } from './activity-view-routing';
import { ActivityViewComponent } from './activity-view.component';
import { AppMaterialModule } from '../../../../app-material/app-material.module';

import { DynamicAutocompleteModule } from '../../../../shared/dynamic-autocomplete/dynamic-autocomplete.module';

import { FileUploadModule } from 'ng2-file-upload';
import { Cloudinary } from 'cloudinary-core';
import { CloudinaryModule } from '@cloudinary/angular-5.x';
import { AngularEditorModule } from '@kolkov/angular-editor';

import { config } from '../../../../config';
import { DynamicDispositionformModule } from 'src/app/shared/dynamic-dispositionform/dynamic-dispositionform.module';



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
    
    DynamicAutocompleteModule,
    DynamicDispositionformModule
    
  ],
  declarations: [
    ActivityViewComponent,
  ],
  providers: [
  ]

})
export class ActivityViewModule { }
