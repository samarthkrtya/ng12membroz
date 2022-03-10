import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './schedule-package-routing';
import { SchedulePackageComponent } from './schedule-package.component';

import { FileUploadModule } from 'ng2-file-upload';
import { Cloudinary } from 'cloudinary-core';
import { CloudinaryModule } from '@cloudinary/angular-5.x';
import { config } from '../../../../config';
const cloudinaryLib = { Cloudinary: Cloudinary };
import { AppMaterialModule } from '../../../../app-material/app-material.module';
import { DynamicAutocompleteModule  } from '../../../../shared/dynamic-autocomplete/dynamic-autocomplete.module';
import { SharedModule } from '../../../../shared/shared.module';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { CommonService } from '../../../../core/services/common/common.service';

import { NgxMaskModule, IConfig } from 'ngx-mask'

export const options: Partial<IConfig> | (() => Partial<IConfig>) = null;


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    routing,
    CloudinaryModule.forRoot(cloudinaryLib, config),
    NgxMaskModule.forRoot(),
    FileUploadModule,
    AngularEditorModule,
    DynamicAutocompleteModule,
    SharedModule,

  ],
  declarations: [
    SchedulePackageComponent,
  ],
  providers: [  
     {
      provide: MAT_DATE_LOCALE,
      deps: [CommonService],
      useFactory: ($locale: CommonService) => $locale.currentLocale()
    }
  ]

})
export class SchedulePackageModule { }
