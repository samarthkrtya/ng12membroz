import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './billitem-template-routing';
import { BillitemTemplateComponent } from './billitem-template.component';
import { AppMaterialModule } from '../../../../app-material/app-material.module';
import { DynamicAutocompleteModule } from '../../../../shared/dynamic-autocomplete/dynamic-autocomplete.module';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { CloudinaryModule, CloudinaryConfiguration } from '@cloudinary/angular-5.x';
import { Cloudinary } from 'cloudinary-core';
import { config } from '../../../../config';
import { FileUploadModule } from 'ng2-file-upload';
//import { activityTemplateService } from 'src/app/core/services/activityTemplate/activityTemplate.service';
import { UsersService } from 'src/app/core/services/users/users.service';
import { NumberToWordsPipe } from 'src/app/shared/components/number-to-words.pipe';

const cloudinaryLib = {
  Cloudinary: Cloudinary
};
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    routing,
    DynamicAutocompleteModule,
    AngularEditorModule,
    CloudinaryModule.forRoot(cloudinaryLib,config),
    //CloudinaryModule.forRoot({Cloudinary}, { cloud_name: 'xxxxxx' } as CloudinaryConfiguration),
    FileUploadModule

  ],
  declarations: [
    BillitemTemplateComponent,

  ],
  providers: [
    //activityTemplateService,
    UsersService, 
    CurrencyPipe,
    DatePipe,
    TitleCasePipe,
    NumberToWordsPipe,
  ], 
})
export class BillitemTemplateModule { }
