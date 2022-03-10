import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './campaign-template.routing';

import { CampaignTemplateComponent } from './campaign-template.component';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRippleModule } from '@angular/material/core';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import { AppMaterialModule } from 'src/app/app-material/app-material.module';
import { MatTabsModule } from '@angular/material/tabs';

@NgModule({
  imports: [
    CommonModule,
    routing,
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
    CampaignTemplateComponent,
  ],
  exports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatRippleModule,
    MatButtonToggleModule
  ],
  providers: [
    CurrencyPipe
  ]
})
export class CampaignTemplateModule { }
