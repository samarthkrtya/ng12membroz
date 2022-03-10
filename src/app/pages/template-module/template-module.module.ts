import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { TemplateRoutes } from './template-module.routing';
import { TemplateModuleComponent } from './template-module.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRippleModule } from '@angular/material/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { AppMaterialModule } from 'src/app/app-material/app-material.module';
import { MatTabsModule } from '@angular/material/tabs';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(TemplateRoutes),
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatRippleModule,
    MatButtonToggleModule,
    AppMaterialModule,
    MatTabsModule
  ],
  declarations: [
    TemplateModuleComponent,
  ]
})
export class TemplateModule{ }