import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './send-questionnaire-routing';
import { SendQuestionnaireComponent } from './send-questionnaire.component';
import { DynamicFormPreviewComponent } from './components/dynamic-form-preview/dynamic-form-preview.component';
import { DynamicDocumentPreviewComponent } from './components/dynamic-document-preview/dynamic-document-preview.component';

import { AppMaterialModule } from '../../../../app-material/app-material.module';
import { DynamicAutocompleteModule } from '../../../../shared/dynamic-autocomplete/dynamic-autocomplete.module';

import { SafeHtmlPipe } from "./safehtml.pipe";

import { SharedModule } from '../../../../shared/shared.module';

import { FileUploadModule } from 'ng2-file-upload';
import { Cloudinary } from 'cloudinary-core';
import { CloudinaryModule } from '@cloudinary/angular-5.x';
import { config } from '../../../../config';
const cloudinaryLib = { Cloudinary: Cloudinary};

import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';


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
    DynamicAutocompleteModule,
    SharedModule,
    FileUploadModule,
    CloudinaryModule.forRoot(cloudinaryLib, config),
    NgxIntlTelInputModule,
    AngularEditorModule,
    NgbModule,
    NgxMatDatetimePickerModule,
    NgxMatNativeDateModule,
    NgxMatTimepickerModule
  ],
  declarations: [
    SendQuestionnaireComponent,
    DynamicFormPreviewComponent,
    DynamicDocumentPreviewComponent,
    SafeHtmlPipe
  ],
  exports: [
    DynamicFormPreviewComponent,
    DynamicDocumentPreviewComponent,
  ],
  providers: [
  ]
})

export class SendQuestionnaireModule { }
