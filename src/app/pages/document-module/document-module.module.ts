import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { DocumentModuleRoutes } from './document-module-routing';
import { DocumentModuleComponent } from './document-module.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(DocumentModuleRoutes),
  ],
  declarations: [
    DocumentModuleComponent
  ],
})
export class DocumentModuleModule { }
