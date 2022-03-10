import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { SupportModuleRoutes } from './support-module-routing';
import { SupportModuleComponent } from './support-module.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(SupportModuleRoutes),
  ],
  declarations: [
    SupportModuleComponent
  ],
})
export class SupportModuleModule { }