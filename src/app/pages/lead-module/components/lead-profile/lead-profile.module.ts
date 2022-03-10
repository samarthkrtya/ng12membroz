import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './lead-profile-routing';

import { LeadProfileComponent } from './lead-profile.component';
import { LeadBasicDetailsComponent } from './components/lead-basic-details/lead-basic-details.component';

import { AppMaterialModule } from '../../../../app-material/app-material.module';
import { ItemListModule } from '../../../../shared/item-list/item-list.module'

import { DynamicAutocompleteModule } from '../../../../shared/dynamic-autocomplete/dynamic-autocomplete.module';
import { DynamicDispositionformModule } from '../../../../shared/dynamic-dispositionform/dynamic-dispositionform.module';
import { DynamicDispositiondataModule } from '../../../../shared/dynamic-dispositiondata/dynamic-dispositiondata.module';
import { SharedModule } from '../../../../shared/shared.module';
import { ContactsActivitiesModule } from '../../../../shared/contacts-activities/contacts-activities.module';

import {FileUploadModule} from 'ng2-file-upload';
import { Cloudinary } from 'cloudinary-core';
import { CloudinaryModule } from '@cloudinary/angular-5.x';
import { config } from '../../../../config';
const cloudinaryLib = { Cloudinary: Cloudinary};

@NgModule({
  imports: [
    CommonModule,
    routing,
    AppMaterialModule,
    ItemListModule,
    FormsModule,
    ReactiveFormsModule,
    DynamicAutocompleteModule,
    DynamicDispositionformModule,
    DynamicDispositiondataModule,
    SharedModule,
    ContactsActivitiesModule,
    CloudinaryModule.forRoot(cloudinaryLib, config),
    FileUploadModule,
  ],
  declarations: [
    LeadProfileComponent,
    LeadBasicDetailsComponent,
  ],
  exports: [
    LeadBasicDetailsComponent,
  ],
  providers: [
    CurrencyPipe
  ]
})
export class LeadProfileModule { }
