import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './document-template-lists-routing';
import { DocumentTemplateListsComponent } from './document-template-lists.component';

import { AppMaterialModule } from '../../../../app-material/app-material.module';

@NgModule({
  imports: [
    CommonModule,
    routing,
    AppMaterialModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  declarations: [
    DocumentTemplateListsComponent,
  ],
  providers: [
  ]
})
export class DocumentTemplateListsModule { }

