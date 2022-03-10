import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './job-frontdesk-routing';
import { JobFrontdeskComponent } from './job-frontdesk.component';
import { AppMaterialModule } from '../../../../app-material/app-material.module';

import { InspectionAssetsModule } from '../../../../shared/inspection-assets/inspection-assets.module';

import { CustomNotesModule } from '../../../../shared/custom-notes/custom-notes.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    routing,
    AppMaterialModule,
    InspectionAssetsModule,
    CustomNotesModule
  ],
  declarations: [
    JobFrontdeskComponent,
    
  ],
  providers: [
  ]
  

})
export class JobFrontdeskModule { }
