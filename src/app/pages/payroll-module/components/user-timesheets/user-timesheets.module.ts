import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { routing } from './user-timesheets-routing';

import { AppMaterialModule } from '../../../../app-material/app-material.module';
import { UserTimesheetsComponent } from './user-timesheets.component';

import { AngularEditorModule } from '@kolkov/angular-editor';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    AngularEditorModule,
    routing,
   
  ],
  declarations: [
    UserTimesheetsComponent
  ],
  providers: [
  ]

})
export class UserTimesheetsModule { }


