import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './job-assignment-routing';
import { JobAssignmentComponent } from './job-assignment.component';
import { AppMaterialModule } from '../../../../app-material/app-material.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    routing,
    AppMaterialModule
  ],
  declarations: [
    JobAssignmentComponent
  ],
  providers: [
  ]

})
export class JobAssignmentModule { }
