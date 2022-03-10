import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './user-access-control.routing';
import { UserAccessControlComponent } from './user-access-control.component';
import { AppMaterialModule } from '../../../../app-material/app-material.module';
import { SharedModule } from '../../../../shared/shared.module';
import { DynamicPropertyFieldsModule } from 'src/app/shared/dynamic-property-fields/dynamic-property-fields.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    routing,
    SharedModule,
    DynamicPropertyFieldsModule
  ],
  declarations: [
    UserAccessControlComponent
  ],
  providers: [
  ]

})
export class UserAccessControlModule { }
