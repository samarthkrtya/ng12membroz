import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AngularEditorModule } from '@kolkov/angular-editor';

import { routing } from './make-event-routing';
import { MakeEventComponent } from './make-event.component';

import { AppMaterialModule } from '../../../../app-material/app-material.module';
import { CommonService } from '../../../../core/services/common/common.service';
import { DynamicAutocompleteModule  } from '../../../../shared/dynamic-autocomplete/dynamic-autocomplete.module';
import { SharedModule } from '../../../../shared/shared.module';
import { DynamicPropertyFieldsModule } from '../../../../shared/dynamic-property-fields/dynamic-property-fields.module';
import { QuickaddModule } from '../../../../shared/quickadd/quickadd.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    routing,
    SharedModule,
    DynamicAutocompleteModule,
    AngularEditorModule,
    DynamicPropertyFieldsModule,
    QuickaddModule,
  ],
  declarations: [
    MakeEventComponent
  ],
  providers: [
    CurrencyPipe,
    CommonService,
  ]
})
export class MakeEventModule { }
