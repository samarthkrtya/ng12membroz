import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { FileUploadModule } from 'ng2-file-upload';
import { Cloudinary } from 'cloudinary-core';
import { CloudinaryModule } from '@cloudinary/angular-5.x';
import { AngularEditorModule } from '@kolkov/angular-editor';

import { config } from '../../../../config';
import { routing } from './email-preview.routing';
import { EmailPreviewComponent } from './email-preview.component';
import { AppMaterialModule } from '../../../../../app/app-material/app-material.module';

const cloudinaryLib = {
  Cloudinary: Cloudinary
};

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    routing,
    FileUploadModule,
    AppMaterialModule,
    AngularEditorModule,
    CloudinaryModule.forRoot(cloudinaryLib, config),
  ],
  declarations: [
    EmailPreviewComponent
  ],
  exports: [
  ],
  providers: [
  ]

})
export class EmailPreviewModule { }
