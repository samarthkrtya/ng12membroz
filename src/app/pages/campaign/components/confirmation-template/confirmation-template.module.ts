import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRippleModule } from '@angular/material/core';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { ConfirmationTemplateComponent } from './confirmation-template.component';
import { routing } from './confirmation-template.routing';
import { SafeHtmlPipe } from './safehtml.pipe';
import { MatRadioModule } from '@angular/material/radio';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
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
    MatCheckboxModule,
    MatRadioModule,
    MatDatepickerModule,
    MatButtonToggleModule,
    MatTabsModule,
  ],
  declarations: [
   ConfirmationTemplateComponent,
   SafeHtmlPipe

  ],
  exports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatRippleModule,
  ],
  providers: [
    CurrencyPipe
  ]
})
export class ConfirmationTemplateModule { }
