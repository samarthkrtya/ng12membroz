import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { SetupRoutes } from './setup-routing';
import { SetupComponent } from './setup.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(SetupRoutes),
  ],
  declarations: [
    SetupComponent
  ],
})
export class SetupModule { }