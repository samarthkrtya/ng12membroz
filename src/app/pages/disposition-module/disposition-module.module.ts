import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { DispositionModuleModuleRoutes } from './disposition-module-routing';
import { DispositionModuleComponent } from './disposition-module.component';
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(DispositionModuleModuleRoutes),
  ],
  declarations: [
    DispositionModuleComponent,
    
  ],
})
export class DispositionModuleModule { }
