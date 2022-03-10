import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './resetuserpassword.routing';
import { ResetuserpasswordComponent } from './resetuserpassword.component';
import { AppMaterialModule } from '../../app-material/app-material.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    routing,
  ],
  declarations: [
    ResetuserpasswordComponent
  ]
})
export class ResetuserpasswordModule { }
