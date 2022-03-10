import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './documents-routing';
import { DocumentsComponent } from './documents.component';
import { SharedDocumentComponent } from './shared-document/shared-document.component';
import { TrashDocumentComponent } from './trash-document/trash-document.component';
import { MydriveDocumentComponent } from './mydrive-document/mydrive-document.component';

import { DocumentCreateFolderComponent } from './document-actions/document-create-folder/document-create-folder.component';
import { DocumentShareComponent } from './document-actions/document-share/document-share.component';
import { DocumentMovetoComponent } from './document-actions/document-moveto/document-moveto.component';
import { DocumentRenameComponent } from './document-actions/document-rename/document-rename.component';
import { DocumentCreateComponent } from './document-actions/document-create/document-create.component';
import { SignedDocumentComponent } from './signed-document/signed-document.component';
import { AcknowledgeDocumentComponent } from './acknowledge-document/acknowledge-document.component';

import { AppMaterialModule } from '../../../../app-material/app-material.module';

import { FileUploadModule } from 'ng2-file-upload';
import { Cloudinary } from 'cloudinary-core';
import { CloudinaryModule } from '@cloudinary/angular-5.x';
import { config } from '../../../../config';
const cloudinaryLib = { Cloudinary: Cloudinary};

import { FormDocumentComponent } from './form-document/form-document.component';
import { DynamicSubListModule } from '../../../../shared/dynamic-sublist/dynamic-sublist.module';
import { FormsService } from '../../../../core/services/forms/forms.service';

@NgModule({
  imports: [
    CommonModule,
    routing,
    AppMaterialModule,
    FormsModule,
    ReactiveFormsModule,
    CloudinaryModule.forRoot(cloudinaryLib, config),
    FileUploadModule,
    DynamicSubListModule
  ],
  declarations: [
    DocumentsComponent,
    SharedDocumentComponent,
    TrashDocumentComponent,
    MydriveDocumentComponent,
    DocumentCreateFolderComponent,
    DocumentShareComponent,
    DocumentMovetoComponent,
    DocumentRenameComponent,
    DocumentCreateComponent,
    FormDocumentComponent,
    SignedDocumentComponent,
    AcknowledgeDocumentComponent,
  ],
  exports: [
    SharedDocumentComponent,
    TrashDocumentComponent,
    MydriveDocumentComponent,
    DocumentCreateFolderComponent,
    DocumentShareComponent,
    DocumentMovetoComponent,
    DocumentRenameComponent,
    SignedDocumentComponent,
    AcknowledgeDocumentComponent,
    
  ],
  providers: [
    FormsService
  ]
})
export class DocumentsModule { }