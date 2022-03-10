import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './document-designer-routing';
import { DocumentDesignerComponent } from './document-designer.component';

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
    DocumentDesignerComponent,
  ],
  providers: [
  ]
})
export class DocumentDesignerModule { }

