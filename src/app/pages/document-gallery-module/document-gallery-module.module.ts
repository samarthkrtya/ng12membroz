import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { DocumentGalleryModuleRoutes } from './document-gallery-module-routing';
import { DocumentGalleryModuleComponent } from './document-gallery-module.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(DocumentGalleryModuleRoutes),
  ],
  declarations: [
    DocumentGalleryModuleComponent
  ],
})
export class DocumentGalleryModuleModule { }
