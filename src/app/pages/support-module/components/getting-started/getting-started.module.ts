import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './getting-started-routing';
import { GettingStartedComponent } from './getting-started.component';
import { AppMaterialModule } from '../../../../app-material/app-material.module';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    SharedModule,
    routing, 
  ],
  declarations: [
    GettingStartedComponent
  ],
  providers: [
  ]

})
export class GettingStartedModule { }
