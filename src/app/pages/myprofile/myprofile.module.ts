import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { routing } from "./myprofile-routing";
import { MyprofileComponent } from "./myprofile.component";

import { FileUploadModule } from "ng2-file-upload";
import { Cloudinary } from "cloudinary-core";
import { CloudinaryModule } from "@cloudinary/angular-5.x";
import { MAT_DATE_LOCALE } from "@angular/material/core";
import { AngularEditorModule } from "@kolkov/angular-editor";

const cloudinaryLib = { Cloudinary: Cloudinary };

import { config } from "src/app/config";
import { AppMaterialModule } from "../../app-material/app-material.module";
import { DynamicAutocompleteModule } from "../../shared/dynamic-autocomplete/dynamic-autocomplete.module";
import { AvailabilityCalendarModule } from "../../shared/availability-calendar/availability-calendar.module";
import { MemberDetailsModule } from "../members/components/member-conversion-page/components/member-details/member-details.module";
import { CommonService } from "../../core/services/common/common.service";

import {
  NgxMatDatetimePickerModule,
  NgxMatNativeDateModule,
  NgxMatTimepickerModule,
} from "@angular-material-components/datetime-picker";

@NgModule({
  imports: [
    CommonModule,
    routing,
    AppMaterialModule,
    FormsModule,
    ReactiveFormsModule,
    CloudinaryModule.forRoot(cloudinaryLib, config),
    FileUploadModule,
    DynamicAutocompleteModule,
    AngularEditorModule,
    NgxMatDatetimePickerModule,
    NgxMatNativeDateModule,
    NgxMatTimepickerModule,
    AvailabilityCalendarModule,
    MemberDetailsModule,
  ],
  declarations: [MyprofileComponent],
  exports: [],
  providers: [
    // {provide: MAT_DATE_LOCALE, useValue: 'en-GB'},
    {
      provide: MAT_DATE_LOCALE,
      deps: [CommonService],
      useFactory: ($locale: CommonService) => $locale.currentLocale(),
    },
  ],
})
export class MyprofileModule {}
