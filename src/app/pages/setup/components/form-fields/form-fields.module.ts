import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './form-fields-routing';

import { FormFieldsComponent } from './form-fields.component';
import { DisplayFieldsComponent } from './display-fields/display-fields.component';
import { AddFieldsComponent } from './add-fields/add-fields.component';
import { AddSectionComponent } from './add-section/add-section.component';

import { AppMaterialModule } from '../../../../app-material/app-material.module';
import { DynamicAutocompleteModule } from '../../../../shared/dynamic-autocomplete/dynamic-autocomplete.module';

import { CommonService } from '../../../../core/services/common/common.service';
import { SharedModule } from '../../../../shared/shared.module';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { NgxSignaturePadModule } from "@o.krucheniuk/ngx-signature-pad";
import { AddGroupComponent } from './add-group/add-group.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import {
  NgxMatDatetimePickerModule, 
  NgxMatNativeDateModule, 
  NgxMatTimepickerModule 
} from '@angular-material-components/datetime-picker';
@NgModule({
  imports: [
    CommonModule,
    routing,
    AppMaterialModule,
    FormsModule,
    ReactiveFormsModule,
    DynamicAutocompleteModule,
    SharedModule,
    AngularEditorModule,
    NgxIntlTelInputModule,
    NgxSignaturePadModule,
    NgbModule,
    NgxMatDatetimePickerModule,
    NgxMatNativeDateModule,
    NgxMatTimepickerModule
  ],
  declarations: [
    FormFieldsComponent,
    DisplayFieldsComponent,
    AddFieldsComponent,
    AddSectionComponent,
    AddGroupComponent,
  ],
  exports: [
    DisplayFieldsComponent,
    AddFieldsComponent,
    AddSectionComponent
  ],
  providers: [
    CommonService,
    CurrencyPipe,
  ]
})
export class FormFieldsModule { }

