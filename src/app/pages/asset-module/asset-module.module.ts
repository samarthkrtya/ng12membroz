import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AssetModuleRoutes } from './asset-module-routing';
import { AssetModuleComponent } from './asset-module.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AssetModuleRoutes),
  ],
  declarations: [
    AssetModuleComponent
  ],
})
export class AssetModuleModule { }