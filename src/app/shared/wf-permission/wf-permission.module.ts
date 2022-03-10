import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { WfPermissionComponent } from './wf-permission.component';
import { AppMaterialModule } from '../../app-material/app-material.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
  ],
  declarations: [WfPermissionComponent],
  exports: [WfPermissionComponent]
})
export class WfPermissionModule { }
