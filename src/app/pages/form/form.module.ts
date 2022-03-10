import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { FormRoutes } from './form-routing';
import { FormComponent } from './form.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(FormRoutes),
  ],
  declarations: [
  FormComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]

})
export class FormModule { }
