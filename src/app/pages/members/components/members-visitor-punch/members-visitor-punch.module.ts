import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './members-visitor-punch-routing';
import { MembersVisitorPunchComponent } from './members-visitor-punch.component';

import { AppMaterialModule } from '../../../../app-material/app-material.module';
import { VisitorPunchModule } from '../../../../shared/visitor-punch/visitor-punch.module';

import { FilterPipe } from './filter.pipe';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    routing,
    AppMaterialModule,
    VisitorPunchModule
  ],
  declarations: [
    MembersVisitorPunchComponent,
    FilterPipe
  ],
  providers: [
  ]
})

export class MembersVisitorPunchModule { }
