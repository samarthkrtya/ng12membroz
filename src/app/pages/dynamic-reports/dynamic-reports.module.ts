
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { routing } from './dynamic-reports.routing';
import { DynamicReportsComponent } from './dynamic-reports.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    routing,
  ],
  declarations: [
    DynamicReportsComponent,
  ]
})
export class DynamicReportsModule { }