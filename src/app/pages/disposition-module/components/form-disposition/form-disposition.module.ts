import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './form-disposition-routing';
import { FormDispositionComponent } from './form-disposition.component';
import { FormDispositionTreeViewComponent } from './form-disposition-tree-view/form-disposition-tree-view.component';
import { FormDispositionFormfieldComponent } from './form-disposition-formfield/form-disposition-formfield.component';
import { FormDispositionRulesComponent } from './form-disposition-rules/form-disposition-rules.component';
import { FormDispositionFormfieldListsComponent } from './form-disposition-formfield-lists/form-disposition-formfield-lists.component';

import { AppMaterialModule } from '../../../../app-material/app-material.module';

import { FileUploadModule } from 'ng2-file-upload';
import { Cloudinary } from 'cloudinary-core';
import { CloudinaryModule } from '@cloudinary/angular-5.x';
import { config } from '../../../../config';


const cloudinaryLib = { Cloudinary: Cloudinary};

import { AngularEditorModule } from '@kolkov/angular-editor';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';

import { NgxSignaturePadModule } from "@o.krucheniuk/ngx-signature-pad";

import {
  NgxMatDatetimePickerModule, 
  NgxMatNativeDateModule, 
  NgxMatTimepickerModule 
} from '@angular-material-components/datetime-picker';

@NgModule({
  imports: [
    CommonModule,
    routing,
    AppMaterialModule,
    FormsModule,
    ReactiveFormsModule,
    CloudinaryModule.forRoot(cloudinaryLib, config),
    FileUploadModule,
    AngularEditorModule,
    NgxIntlTelInputModule,
    NgxSignaturePadModule,
    NgxMatDatetimePickerModule,
    NgxMatNativeDateModule,
    NgxMatTimepickerModule
  ],
  declarations: [
    FormDispositionComponent,
    FormDispositionTreeViewComponent,
    FormDispositionFormfieldComponent,
    FormDispositionRulesComponent,
    FormDispositionFormfieldListsComponent,
  ],
  exports: [
    FormDispositionTreeViewComponent,
    FormDispositionFormfieldComponent,
    FormDispositionRulesComponent,
    FormDispositionFormfieldListsComponent,
    
  ]
})
export class FormDispositionModule { }

