import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './create-ticket-routing';
import { CreateTicketComponent } from './create-ticket.component';

import { AppMaterialModule } from '../../../../app-material/app-material.module';
import { FileUploadModule } from 'ng2-file-upload';
import { Cloudinary } from 'cloudinary-core';
import { CloudinaryModule } from '@cloudinary/angular-5.x';
import { config } from '../../../../config';
const cloudinaryLib = { Cloudinary: Cloudinary };
import { AngularEditorModule } from '@kolkov/angular-editor';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    AngularEditorModule,
    CloudinaryModule.forRoot(cloudinaryLib, config),
    FileUploadModule,
    routing,
  ],
  declarations: [
    CreateTicketComponent
  ],
  providers: [
  ]

})
export class CreateSupportModule { }
