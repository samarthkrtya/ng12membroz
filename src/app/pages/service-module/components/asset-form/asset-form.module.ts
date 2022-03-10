import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AngularEditorModule } from '@kolkov/angular-editor';

import { FileUploadModule } from 'ng2-file-upload';
import { Cloudinary } from 'cloudinary-core';
import { CloudinaryModule } from '@cloudinary/angular-5.x';
import { config } from '../../../../config';
const cloudinaryLib = { Cloudinary: Cloudinary };

import { routing } from './asset-form-routing';
import { AssetComponent } from './asset-form.component';
import { AppMaterialModule } from '../../../../app-material/app-material.module';
import { FormdataService } from '../../../../core/services/formdata/formdata.service';
import { TaxesService } from '../../../../core/services/payment/taxes.service';
import { WfPermissionModule } from '../../../../shared/wf-permission/wf-permission.module';
import { AssetService } from '../../../../core/services/service/asset.service';
import { DynamicAutocompleteModule } from '../../../../shared/dynamic-autocomplete/dynamic-autocomplete.module';
import { QuickaddModule } from '../../../../shared/quickadd/quickadd.module';
import { WorkingDaysModule } from '../../../../shared/workingdays/workingdays.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    routing,
    AngularEditorModule,
    FileUploadModule,
    CloudinaryModule.forRoot(cloudinaryLib, config),
    FileUploadModule,
    WfPermissionModule,
    DynamicAutocompleteModule,
    QuickaddModule,
    WorkingDaysModule
  ],
  declarations: [
    AssetComponent
  ],
  providers: [
    FormdataService,
    TaxesService,
    AssetService
  ]

})
export class AssetFormModule { }
