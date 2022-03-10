import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './scheduler-integration-routing';
import { SchedulerIntegrationComponent } from './scheduler-integration.component';

import { DynamicSubListModule } from '../../../../shared/dynamic-sublist/dynamic-sublist.module';
import { FormsService } from '../../../../core/services/forms/forms.service';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    routing,
    DynamicSubListModule
  ],
  declarations: [
    SchedulerIntegrationComponent,
  ],
  providers: [
    FormsService
  ]
})
export class TemplateIntegrationModule { }
