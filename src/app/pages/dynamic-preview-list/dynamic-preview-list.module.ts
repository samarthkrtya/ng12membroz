import { CommonModule, DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppMaterialModule } from '../../../app/app-material/app-material.module';
import { routing } from './dynamic-preview-list-routing';
import { DynamicPreviewListComponent, SafeHtmlPipe } from './dynamic-preview-list.component';
import { PreviewComponent } from './preview/preview.component';
import { MoreActionBtnComponent } from './more-action-btn/more-action-btn.component';
import { ItemListModule } from '../../shared/item-list/item-list.module'
import { SubjectsService } from '../../../app/core/services/common/subjects.service';

import { AngularEditorModule } from '@kolkov/angular-editor';
 

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    routing,
    ItemListModule,
    AngularEditorModule
  ],
  declarations: [
    DynamicPreviewListComponent,
    PreviewComponent,
    MoreActionBtnComponent,
    SafeHtmlPipe,
  ],
  exports: [
    PreviewComponent,
    MoreActionBtnComponent,
  ],
  providers: [
    DatePipe,
    SubjectsService,
  ]
})
export class DynamicPreviewListModule { }


