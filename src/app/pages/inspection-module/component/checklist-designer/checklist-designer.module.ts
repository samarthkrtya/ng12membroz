import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './checklist-designer-routing';
import { ChecklistDesignerComponent } from './checklist-designer.component';
import { EditFormnameInspectionDesignerComponent } from './edit-formname-inspection-designer/edit-formname-inspection-designer.component';
import { AppMaterialModule } from '../../../../app-material/app-material.module';
import { ChecklistDisplayFieldComponent } from './checklist-display-field/checklist-display-field.component';

import {
  NgxMatDatetimePickerModule, 
  NgxMatNativeDateModule, 
  NgxMatTimepickerModule 
} from '@angular-material-components/datetime-picker';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    routing,
    AppMaterialModule,
    NgxMatDatetimePickerModule,
    NgxMatNativeDateModule,
    NgxMatTimepickerModule
  ],
  declarations: [
    ChecklistDesignerComponent,
    ChecklistDisplayFieldComponent,
    EditFormnameInspectionDesignerComponent,
  ],
  exports: [
    EditFormnameInspectionDesignerComponent
  ],
  providers: [
  ]

})
export class ChecklistDesignerModule { }
