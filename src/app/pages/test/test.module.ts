import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './test-routing';
import { TestComponent } from './test.component';

import { AppMaterialModule } from '../../app-material/app-material.module';

import { MemberService } from '../../core/services/member/member.service';

import { DynamicAutocompleteModule } from '../../shared/dynamic-autocomplete/dynamic-autocomplete.module';

import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { AngularEditorModule } from '@kolkov/angular-editor';

import {FileUploadModule} from 'ng2-file-upload';
import { Cloudinary } from 'cloudinary-core';
import { CloudinaryModule } from '@cloudinary/angular-5.x';
import { config } from '../../config';
const cloudinaryLib = { Cloudinary: Cloudinary};


import { FullCalendarModule } from '@fullcalendar/angular'; // the main connector. must go first
import dayGridPlugin from '@fullcalendar/daygrid'; // a plugin
import interactionPlugin from '@fullcalendar/interaction'; // a plugin
import timeGridPlugin from '@fullcalendar/timegrid';
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid';

FullCalendarModule.registerPlugins([ // register FullCalendar plugins
  dayGridPlugin,
  interactionPlugin,
  timeGridPlugin,
  resourceTimeGridPlugin
]);

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    routing,
    AppMaterialModule,
    ReactiveFormsModule,
    DynamicAutocompleteModule,
    NgxIntlTelInputModule,
    AngularEditorModule,
    CloudinaryModule.forRoot(cloudinaryLib, config),
    FileUploadModule,
    FullCalendarModule,
    NgbModule
  ],
  declarations: [
    TestComponent,
  ],
  providers: [
    MemberService
  ]
  
})
export class TestModule {}
