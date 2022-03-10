import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './template-integration-routing';
import { TemplateIntegrationComponent } from './template-integration.component';
import { DynamicSubListModule } from '../.././../../shared/dynamic-sublist/dynamic-sublist.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    routing,
    DynamicSubListModule
  ],
  declarations: [
    TemplateIntegrationComponent,
  ],
  providers: [
  ]

})
export class TemplateIntegrationModule { }
