import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './job-activity-view-routing';
import { JobActivityViewComponent } from './job-activity-view.component';

import { AppMaterialModule } from '../../../../app-material/app-material.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    routing,
    AppMaterialModule,
    routing,
  ],
  declarations: [
    JobActivityViewComponent,
  ],
  providers: [
    CurrencyPipe,
  ]

})
export class JobActivityViewModule { }
