import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { UserRoutes } from './user-routing';
import { UserComponent } from './user.component';
import { UserAccessControlComponent } from './components/user-access-control/user-access-control.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(UserRoutes),
  ],
  declarations: [
    UserComponent
  ]
})
export class UserModule { }