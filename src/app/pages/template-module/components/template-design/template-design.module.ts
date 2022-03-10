import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TemplateDesignRoutingModule } from './template-design-routing.module';
import { EmailEditorModule } from 'angular-email-editor';
import { TemplateDesignComponent } from './template-design.component';
import { AppMaterialModule } from 'src/app/app-material/app-material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    TemplateDesignComponent,
  ],
  imports: [
    CommonModule,
    TemplateDesignRoutingModule,
    EmailEditorModule,
    AppMaterialModule,
    FormsModule,
    ReactiveFormsModule

  ]
})
export class TemplateDesignModule { }
