import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AngularEditorModule } from '@kolkov/angular-editor';

import { routing } from './approval-req-form-routing';
import { ApprovalReqFormComponent } from './approval-req-form.component';

import { AppMaterialModule } from '../../../../app-material/app-material.module';
import { SharedModule } from '../../../../shared/shared.module';
import { GlobalConfirmationModule } from '../../../../shared/global-confirmation/global-confirmation.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    routing,
    SharedModule,
    AngularEditorModule,
    GlobalConfirmationModule
  ],
  declarations: [
    ApprovalReqFormComponent
  ],
  providers: [
    CurrencyPipe,
  ]

})
export class ApprovalReqFormModule { }
