import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { RouterModule } from '@angular/router';
import { AutomationComponent } from './automation.component';

import { AutomationRoutes } from './automation.routing';
import { TaskComponent } from './components/task/task.component';
import { AppMaterialModule } from 'src/app/app-material/app-material.module';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { MatSelectModule } from '@angular/material/select';
import { FileUploadModule } from 'ng2-file-upload';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(AutomationRoutes),
    AppMaterialModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    AngularEditorModule,
    FileUploadModule,
  ],
  declarations: [
    AutomationComponent
  ],
})
export class AutomationModule {}


