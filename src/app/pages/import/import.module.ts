import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './import-routing';

import { ImportComponent } from './import.component';
import { ImportUploadComponent } from './components/import-upload/import-upload.component';
import { ImportDataRenderComponent } from './components/import-data-render/import-data-render.component';
import { ImportMappingFieldsComponent } from './components/import-mapping-fields/import-mapping-fields.component';
import { ImportReviewFieldsComponent } from './components/import-review-fields/import-review-fields.component';
import { ImportSubmitComponent } from './components/import-submit/import-submit.component';

import { ImportService } from '../../core/services/import/import.service';
import { SchemasService } from '../../core/services/schemas/schemas.service';
import { FormsService } from '../../core/services/forms/forms.service';
import { PendingChangesGuard } from '../../core/services/common/pendingchanges-guard.service';

import {FileUploadModule} from 'ng2-file-upload';
import { AppMaterialModule } from '../../app-material/app-material.module';

import { Cloudinary } from 'cloudinary-core';
import { CloudinaryModule, CloudinaryConfiguration } from '@cloudinary/angular-5.x';

import { config } from '../../config';

const cloudinaryLib = {
  Cloudinary: Cloudinary
};
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    routing,
    ReactiveFormsModule,
    CloudinaryModule.forRoot(cloudinaryLib, config),
    FileUploadModule,
    AppMaterialModule
  ],
  declarations: [
    ImportComponent, 
    ImportSubmitComponent,
    ImportUploadComponent,
    ImportDataRenderComponent,
    ImportMappingFieldsComponent,
    ImportReviewFieldsComponent,
  ],
  exports:[
    ImportUploadComponent,
    ImportDataRenderComponent,
    ImportMappingFieldsComponent,
    ImportReviewFieldsComponent,
    ImportSubmitComponent
  ],
  providers:[
    PendingChangesGuard,
    ImportService,
    SchemasService,
    FormsService,
  ]
})
export class ImportModule { }
