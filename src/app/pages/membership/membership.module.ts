import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MembershipRoutes } from './membership-routing';
import { MembershipComponent } from './membership.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(MembershipRoutes),
  ],
  declarations: [
    MembershipComponent
  ],
})
export class MembershipModule { }