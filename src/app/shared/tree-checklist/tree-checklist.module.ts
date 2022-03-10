import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


import { TreeChecklist } from './tree-checklist.component';

import { AppMaterialModule } from '../../app-material/app-material.module'
import { CommonService } from '../../core/services/common/common.service';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    AppMaterialModule
  ],
  declarations: [
    TreeChecklist
  ],
  exports: [
    TreeChecklist
  ],
  providers: [
    CommonService,
  ]

})
export class TreeChecklistModule { }
