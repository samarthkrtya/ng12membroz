import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DynamictabComponent } from './dynamictab.component';
import { CommonService } from '../../core/services/common/common.service';
import { RoleService } from '../../core/services/role/role.service';
import { FormdataService } from '../../core/services/formdata/formdata.service';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [DynamictabComponent],
  exports: [DynamictabComponent],
  providers:[
    CommonService,
    RoleService,
    FormdataService
  ]
})
export class DynamictabModule { }
