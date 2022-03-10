import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './support-ticket-routing';
import { SupportTicketComponent } from './support-ticket.component';

import { AppMaterialModule } from '../../../../app-material/app-material.module';
import { FileUploadModule } from 'ng2-file-upload';
import { Cloudinary } from 'cloudinary-core';
import { CloudinaryModule } from '@cloudinary/angular-5.x';
import { config } from '../../../../config';
const cloudinaryLib = { Cloudinary: Cloudinary };
import { AngularEditorModule } from '@kolkov/angular-editor';
import { DynamicAutocompleteModule } from 'src/app/shared/dynamic-autocomplete/dynamic-autocomplete.module';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    AngularEditorModule,
    routing,
    CloudinaryModule.forRoot(cloudinaryLib, config),
    FileUploadModule,
    DynamicAutocompleteModule,
    SharedModule
  ],
  declarations: [
    SupportTicketComponent
  ],
  providers: [
  ]

})
export class SupportTicketModule { }
