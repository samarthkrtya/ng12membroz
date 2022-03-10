import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ExampleRoutingModule } from './template-design-routing.module';
import { EmailEditorModule } from 'angular-email-editor';

import { ExampleComponent } from './template-design.component';
import { TemplateViewComponent } from './components/template-view/template-view.component';
import { SafeHtmlPipe } from './safehtml.pipe';
import { AppMaterialModule } from 'src/app/app-material/app-material.module';
@NgModule({
  declarations: [
    ExampleComponent,
    // DashboardComponent,
    TemplateViewComponent,
    SafeHtmlPipe,

  ],
  imports: [
    CommonModule,
    ExampleRoutingModule,
    EmailEditorModule,
    AppMaterialModule,
    
  ]
})
export class ExampleModule { }
