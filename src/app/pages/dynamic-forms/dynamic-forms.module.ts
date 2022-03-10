import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule,DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './dynamic-forms-routing';
import { DynamicFormsComponent } from './dynamic-forms.component';
import { FormBuilderComponent } from './form-builder/form-builder.component';

import { AppMaterialModule } from '../../app-material/app-material.module';

import { CommonService  } from '../../core/services/common/common.service';
import { PendingChangesGuard } from './../../core/services/common/pendingchanges-guard.service';

import { DynamictabModule } from '../../shared/dynamictab/dynamictab.module';
import { DynamicAutocompleteModule } from '../../shared/dynamic-autocomplete/dynamic-autocomplete.module';
import { DynamicAutocompleteOndemandModule } from '../../shared/dynamic-autocomplete-ondemand/dynamic-autocomplete-ondemand.module';
import { SharedModule } from '../../shared/shared.module';
import { WfPermissionModule } from '../../shared/wf-permission/wf-permission.module';
import { QuickaddModule } from '../../shared/quickadd/quickadd.module';

import { FileUploadModule } from 'ng2-file-upload';
import { Cloudinary } from 'cloudinary-core';
import { CloudinaryModule } from '@cloudinary/angular-5.x';
import { config } from '../../config';
const cloudinaryLib = { Cloudinary: Cloudinary};

import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { AngularEditorModule } from '@kolkov/angular-editor';

import { MAT_DATE_LOCALE } from '@angular/material/core';
import { LOCALE_ID} from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import {
  NgxMatDatetimePickerModule, 
  NgxMatNativeDateModule, 
  NgxMatTimepickerModule 
} from '@angular-material-components/datetime-picker';

import { NgxSignaturePadModule } from "@o.krucheniuk/ngx-signature-pad";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    routing,
    CloudinaryModule.forRoot(cloudinaryLib, config),
    FileUploadModule,
    NgxIntlTelInputModule,
    AngularEditorModule,
    AppMaterialModule,
    SharedModule,
    DynamictabModule,
    DynamicAutocompleteModule,
    DynamicAutocompleteOndemandModule,
    WfPermissionModule,
    NgbModule,
    QuickaddModule,
    NgxMatDatetimePickerModule,
    NgxMatNativeDateModule,
    NgxMatTimepickerModule,
    NgxSignaturePadModule
  ],
  declarations: [
    DynamicFormsComponent,
    FormBuilderComponent,
  ],
  exports:[
    FormBuilderComponent
  ],
  providers: [
    CommonService,
    PendingChangesGuard,
    //{provide: MAT_DATE_LOCALE, useValue: 'en-GB'},
    {
      provide: MAT_DATE_LOCALE,
      deps: [CommonService],
      useFactory: ($locale: CommonService) => $locale.currentLocale()
    }
  ]
})
export class DynamicFormsModule {}

