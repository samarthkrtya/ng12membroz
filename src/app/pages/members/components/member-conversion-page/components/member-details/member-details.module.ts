import { NgModule } from "@angular/core";
import { CommonModule, CurrencyPipe } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { RouterModule } from "@angular/router";
import { MemberDetailsComponent } from "./member-details.component";

import { FileUploadModule } from "ng2-file-upload";
import { Cloudinary } from "cloudinary-core";
import { CloudinaryModule } from "@cloudinary/angular-5.x";
import { AngularEditorModule } from "@kolkov/angular-editor";
import { config } from "src/app/config";
import { AppMaterialModule } from "src/app/app-material/app-material.module";
import { DynamicAutocompleteModule } from "src/app/shared/dynamic-autocomplete/dynamic-autocomplete.module";
const cloudinaryLib = { Cloudinary: Cloudinary };

import {
  NgxMatDatetimePickerModule,
  NgxMatNativeDateModule,
  NgxMatTimepickerModule,
} from "@angular-material-components/datetime-picker";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    RouterModule,
    CloudinaryModule.forRoot(cloudinaryLib, config),
    FileUploadModule,
    DynamicAutocompleteModule,
    AngularEditorModule,
    NgxMatDatetimePickerModule,
    NgxMatNativeDateModule,
    NgxMatTimepickerModule,
  ],
  declarations: [MemberDetailsComponent],
  exports: [MemberDetailsComponent],
  providers: [CurrencyPipe],
})

export class MemberDetailsModule {}
