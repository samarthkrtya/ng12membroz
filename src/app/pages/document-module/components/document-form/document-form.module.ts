import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './document-form-routing';
import { DocumentFormComponent } from './document-form.component';
import { DocumentFieldValueComponent } from './document-field-value/document-field-value.component';

import { DynamicAutocompleteModule } from '../../../../shared/dynamic-autocomplete/dynamic-autocomplete.module';
import { AppMaterialModule } from '../../../../app-material/app-material.module';

import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';

import { FileUploadModule } from 'ng2-file-upload';
import { Cloudinary } from 'cloudinary-core';
import { CloudinaryModule } from '@cloudinary/angular-5.x';
import { config } from '../../../../config';
const cloudinaryLib = { Cloudinary: Cloudinary};

import { SafeHtmlPipe } from "./safehtml.pipe";

import { NgxSignaturePadModule } from "@o.krucheniuk/ngx-signature-pad";

import {
  NgxMatDatetimePickerModule, 
  NgxMatNativeDateModule, 
  NgxMatTimepickerModule 
} from '@angular-material-components/datetime-picker';

import { MAT_DATE_LOCALE } from '@angular/material/core';
import { CommonService  } from '../../../../core/services/common/common.service';

@NgModule({
  imports: [
    CommonModule,
    routing,
    AppMaterialModule,
    FormsModule,
    ReactiveFormsModule,
    NgxIntlTelInputModule,
    DynamicAutocompleteModule,
    CloudinaryModule.forRoot(cloudinaryLib, config),
    FileUploadModule,
    NgxSignaturePadModule,
    NgxMatDatetimePickerModule,
    NgxMatNativeDateModule,
    NgxMatTimepickerModule
  ],
  declarations: [
    DocumentFormComponent,
    DocumentFieldValueComponent,
    SafeHtmlPipe
  ],
  exports: [
    DocumentFieldValueComponent
  ],
  providers: [
    {
      provide: MAT_DATE_LOCALE,
      deps: [CommonService],
      useFactory: ($locale: CommonService) => $locale.currentLocale()
    }
  ]
})
export class DocumentFormModule { }

