import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ContactsActivitiesComponent } from './contacts-activities.component';
import { OpenActivityComponent } from './components/open-activity/open-activity.component';
import { CloseActivityComponent } from './components/close-activity/close-activity.component';
import { ContactsTimelineComponent } from './components/contacts-timeline/contacts-timeline.component';
import { ContactsCommunicationComponent } from './components/contacts-communication/contacts-communication.component';
import { ContactsActivityLogComponent } from './components/contacts-activity-log/contacts-activity-log.component';
import { ContactsSendMessageComponent } from './components/contacts-send-message/contacts-send-message.component';
import { ContactsNotesComponent } from './components/contacts-notes/contacts-notes.component';
import { ContactsAttachmentComponent } from './components/contacts-attachment/contacts-attachment.component';

import { DynamicAutocompleteModule } from '../../shared/dynamic-autocomplete/dynamic-autocomplete.module';
import { AppMaterialModule } from '../../app-material/app-material.module';
import { DynamicDispositionformModule } from '../../shared/dynamic-dispositionform/dynamic-dispositionform.module';

import { CommonService } from '../../core/services/common/common.service';

import { AngularEditorModule } from '@kolkov/angular-editor';

import {FileUploadModule} from 'ng2-file-upload';
import { Cloudinary } from 'cloudinary-core';
import { CloudinaryModule } from '@cloudinary/angular-5.x';
import { config } from '../../config';
const cloudinaryLib = { Cloudinary: Cloudinary};

import { FilterPipe } from './filter.pipe';
import { SharedModule } from '../shared.module';

import {
  NgxMatDatetimePickerModule, 
  NgxMatNativeDateModule, 
  NgxMatTimepickerModule 
} from '@angular-material-components/datetime-picker';
import { ContactsAlertsComponent } from './components/contacts-alerts/contacts-alerts.component';
import { ContactsEmploymentStatusComponent } from './components/contacts-employment-status/contacts-employment-status.component';

@NgModule({
  imports: [
    CommonModule,
    DynamicAutocompleteModule,
    AppMaterialModule,
    DynamicDispositionformModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    AngularEditorModule,
    CloudinaryModule.forRoot(cloudinaryLib, config),
    FileUploadModule,
    SharedModule,
    NgxMatDatetimePickerModule,
    NgxMatNativeDateModule,
    NgxMatTimepickerModule
  ],
  declarations: [
    ContactsActivitiesComponent, 
    OpenActivityComponent, 
    CloseActivityComponent, 
    ContactsTimelineComponent, 
    ContactsCommunicationComponent, 
    ContactsActivityLogComponent, 
    ContactsSendMessageComponent, 
    ContactsNotesComponent, 
    ContactsAttachmentComponent,
    ContactsAlertsComponent,
    ContactsEmploymentStatusComponent,
    FilterPipe
  ],
  exports: [
    OpenActivityComponent, 
    CloseActivityComponent,
    ContactsTimelineComponent, 
    ContactsCommunicationComponent, 
    ContactsActivityLogComponent,
    ContactsSendMessageComponent,
    ContactsNotesComponent,
    ContactsAttachmentComponent,
    ContactsAlertsComponent,
    ContactsEmploymentStatusComponent
],
  providers:[
    CommonService
  ]
})
export class ContactsActivitiesModule { }
