import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AngularEditorModule } from '@kolkov/angular-editor';
import { FileUploadModule } from 'ng2-file-upload';
import { Cloudinary } from 'cloudinary-core';
import { CloudinaryModule } from '@cloudinary/angular-5.x';
import { config } from '../../../../config';
const cloudinaryLib = { Cloudinary: Cloudinary };

import { routing } from './service-form-routing';
import { ServiceComponent } from './service-form.component';
import { AppMaterialModule } from '../../../../app-material/app-material.module';
import { FormdataService } from '../../../../core/services/formdata/formdata.service';
import { UsersService } from '../../../../core/services/users/users.service';
import { TaxesService } from '../../../../core/services/payment/taxes.service';
import { ServiceService } from '../../../../core/services/service/service.service';
import { WfPermissionModule } from '../../../../shared/wf-permission/wf-permission.module';
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
    ServiceComponent
  ],
  providers: [
    FormdataService,
    UsersService,
    TaxesService,
    ServiceService
  ]

})
export class ServiceFormModule { }
