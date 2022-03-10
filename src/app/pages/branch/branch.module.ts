import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { BranchRoutes } from './branch-routing';
import { BranchComponent } from './branch.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(BranchRoutes),
  ],
  declarations: [
    BranchComponent,
  ]
})
export class BranchModule { }