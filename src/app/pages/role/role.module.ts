import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { RoleRoutes } from './role-routing';
import { RoleComponent } from './role.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';


@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(RoleRoutes),
  ],
  declarations: [
  RoleComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]

})
export class RoleModule { }
