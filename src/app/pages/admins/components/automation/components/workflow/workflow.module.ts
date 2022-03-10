import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { WorkflowComponent } from './workflow.component';
import { routing } from './workflow-routing';

import { AppMaterialModule } from '../../../../../../app-material/app-material.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    routing,
    AppMaterialModule
  ],
  declarations: [
    WorkflowComponent
  ],
  providers: [
    
  ],
})

export class WorkflowModule { }