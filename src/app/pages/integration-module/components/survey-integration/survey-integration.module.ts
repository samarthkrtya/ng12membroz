import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './survey-integration-routing';
import { SurveyIntegrationComponent } from './survey-integration.component';
import { FormsService } from '../../../../core/services/forms/forms.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    routing
  ],
  declarations: [
    SurveyIntegrationComponent,
  ],
  providers: [
    FormsService
  ]

})
export class SurveyIntegrationModule { }
