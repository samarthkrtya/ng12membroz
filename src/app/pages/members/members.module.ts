import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MembersRoutes } from './members-routing';
import { MembersComponent } from './members.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(MembersRoutes),
  ],
  declarations: [
    MembersComponent
  ],
})
export class MembersModule { }